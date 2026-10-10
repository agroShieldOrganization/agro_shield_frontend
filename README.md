
  # AgroShield AI Dashboard Design

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  


  # AgroShield PostgreSQL Database Structure

## Purpose
This document proposes a PostgreSQL schema for AgroShield based on the current application structure in `src/app`.

The design separates:
- durable business data that should live in PostgreSQL
- derived advisories and alerts that may be worth storing
- direct Tomorrow.io weather data that should usually be fetched live and not permanently stored

## What The Current App Implies
From the current pages and components, the application needs persistent support for:
- user accounts and profile/settings
- farms with coordinates and location metadata
- crop registrations and planting cycles
- soil observations by farm or farm section
- community incident reports and their review workflow
- generated alerts and notifications
- AI chat sessions and saved recommendations

The application also displays many values that look like live climate intelligence:
- current weather
- rainfall probability
- humidity
- wind
- short-term forecasts
- flood probability
- planting recommendations based on current conditions

Those live weather values should not be stored in the main relational schema unless you later decide to support auditing, historical analytics, offline fallback, or model training.

## Recommended PostgreSQL Extensions
- `pgcrypto` for `gen_random_uuid()`
- `citext` for case-insensitive email handling
- `postgis` for geospatial queries on farm/report coordinates

## High-Level Domain Model
1. `users` own farms, reports, chat sessions, and preferences.
2. `farms` represent registered farm locations.
3. `farm_plots` or `farm_sections` break a farm into smaller monitored areas when needed.
4. `crop_cycles` store what is planted, where, and when.
5. `soil_observations` store measured soil metrics over time.
6. `incident_reports` store community-submitted events such as flood, pest, drought, disease, fire, and erosion.
7. `alerts` store actionable warnings shown to users.
8. `notifications` store delivery records and read state.
9. `ai_conversations` and `ai_messages` store assistant history if chat persistence is needed.

## Core Schema

### 1. users
Use this as the main identity table if auth is handled internally. If auth is external, keep this as the application profile table keyed to the auth provider ID.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | default `gen_random_uuid()` |
| email | citext unique not null | login/contact email |
| full_name | text not null | user full name |
| organization_name | text null | from Settings page |
| phone | text null | optional |
| role | text not null default `'farmer'` | `farmer`, `admin`, `reviewer`, `analyst` |
| status | text not null default `'active'` | `active`, `suspended`, `deleted` |
| password_hash | text null | only if local auth is used |
| created_at | timestamptz not null default now() |  |
| updated_at | timestamptz not null default now() |  |

### 2. user_preferences
Stores settings from the Settings page and notification/privacy preferences.

| Column | Type | Notes |
|---|---|---|
| user_id | uuid pk fk users(id) | one row per user |
| primary_location_name | text null | e.g. Abuja, Nigeria |
| timezone | text not null default `'Africa/Lagos'` | |
| units_system | text not null default `'metric'` | metric/imperial |
| allow_location_tracking | boolean not null default true | |
| share_farm_data_with_community | boolean not null default false | |
| share_anonymized_research_data | boolean not null default true | |
| notify_flood_alerts | boolean not null default true | |
| notify_planting_recommendations | boolean not null default true | |
| notify_pest_warnings | boolean not null default true | |
| notify_weather_updates | boolean not null default false | |
| notify_community_reports | boolean not null default true | |
| notify_email | boolean not null default false | |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

### 3. farms
Backs `AddFarm` and `MyFarms`.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| owner_user_id | uuid not null fk users(id) | farm owner |
| name | text not null | farm name |
| location_name | text not null | user-entered area/location |
| country | text not null default `'Nigeria'` | |
| state_region | text null | Kaduna, Benue, etc. |
| address_text | text null | fuller freeform address |
| latitude | numeric(9,6) not null | |
| longitude | numeric(9,6) not null | |
| geo_point | geography(Point, 4326) not null | derived from lat/lng |
| size_hectares | numeric(10,2) null | normalized from text like `12 hectares` |
| primary_crop_name | text null | convenience field |
| health_score | numeric(5,2) null | latest computed score |
| status | text not null default `'active'` | `active`, `inactive`, `archived` |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

Recommended indexes:
- `idx_farms_owner_user_id`
- `idx_farms_geo_point` using GIST
- `idx_farms_state_region`

### 4. farm_sections
Needed because the app already refers to areas like `Section A`, `North Field`, `East Block`, and `West Sector` in soil intelligence.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| farm_id | uuid not null fk farms(id) | |
| name | text not null | e.g. North Field |
| area_hectares | numeric(10,2) null | |
| latitude | numeric(9,6) null | optional centroid |
| longitude | numeric(9,6) null | optional centroid |
| geo_point | geography(Point, 4326) null | |
| soil_type | text null | loamy, clay, sandy loam |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

### 5. crop_cycles
Represents planted crops and planting plans from `AddCropDialog` and `PlantingAdvisor`.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| farm_id | uuid not null fk farms(id) | |
| farm_section_id | uuid null fk farm_sections(id) | nullable if whole-farm crop |
| created_by_user_id | uuid not null fk users(id) | |
| crop_name | text not null | maize, rice, cassava, custom crop |
| season | text null | `wet`, `dry` |
| planting_date | date not null | |
| expected_harvest_date | date null | |
| expected_yield_kg_per_hectare | numeric(10,2) null | normalized value |
| expected_area_hectares | numeric(10,2) null | from Add Crop dialog |
| actual_yield_kg | numeric(12,2) null | for analytics |
| status | text not null default `'planned'` | `planned`, `planted`, `growing`, `harvested`, `failed` |
| notes | text null | |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

### 6. irrigation_events
Needed because `MyFarms` shows last irrigation and future recommendations may depend on it.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| farm_id | uuid not null fk farms(id) | |
| farm_section_id | uuid null fk farm_sections(id) | |
| crop_cycle_id | uuid null fk crop_cycles(id) | |
| irrigated_at | timestamptz not null | |
| method | text null | drip, sprinkler, flood |
| water_volume_liters | numeric(12,2) null | |
| notes | text null | |
| created_by_user_id | uuid null fk users(id) | |

### 7. soil_observations
Stores measured soil metrics over time. This is a durable history table and useful for analytics.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| farm_id | uuid not null fk farms(id) | |
| farm_section_id | uuid null fk farm_sections(id) | |
| observed_at | timestamptz not null | |
| source | text not null | `manual`, `sensor`, `lab`, `derived` |
| soil_type | text null | |
| ph | numeric(4,2) null | |
| nitrogen_pct | numeric(5,2) null | |
| phosphorus_pct | numeric(5,2) null | |
| potassium_pct | numeric(5,2) null | |
| organic_matter_pct | numeric(5,2) null | |
| moisture_pct | numeric(5,2) null | |
| temperature_c | numeric(5,2) null | |
| health_rating | text null | `excellent`, `good`, `fair`, `poor` |
| raw_payload | jsonb null | optional for lab/sensor import |
| created_at | timestamptz not null default now() | |

Recommended indexes:
- `idx_soil_observations_farm_id_observed_at`
- `idx_soil_observations_farm_section_id_observed_at`

### 8. incident_reports
Backs `SubmitReport`, `CommunityReports`, and community alert generation.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| reporter_user_id | uuid null fk users(id) | allow anonymous/community import later |
| incident_type | text not null | `flooding`, `pest`, `disease`, `drought`, `fire`, `erosion`, `other` |
| severity | text not null | `low`, `medium`, `high` |
| title | text null | optional generated summary |
| location_name | text not null | |
| latitude | numeric(9,6) null | optional in UI |
| longitude | numeric(9,6) null | optional in UI |
| geo_point | geography(Point, 4326) null | |
| description | text not null | |
| affected_area_hectares | numeric(10,2) null | normalize from text if possible |
| contact_phone | text null | |
| verification_status | text not null default `'pending'` | `pending`, `under_review`, `verified`, `rejected` |
| public_visibility | text not null default `'community'` | `private`, `community`, `admin_only` |
| occurred_at | timestamptz null | if known |
| submitted_at | timestamptz not null default now() | |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

Recommended indexes:
- `idx_incident_reports_incident_type`
- `idx_incident_reports_severity`
- `idx_incident_reports_verification_status`
- `idx_incident_reports_geo_point` using GIST
- `idx_incident_reports_submitted_at`

### 9. incident_report_media
The UI already hints at future image upload.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| report_id | uuid not null fk incident_reports(id) on delete cascade | |
| storage_url | text not null | object storage path |
| mime_type | text null | |
| file_size_bytes | bigint null | |
| width_px | integer null | |
| height_px | integer null | |
| uploaded_at | timestamptz not null default now() | |

### 10. incident_report_reviews
Supports the “all reports are reviewed before being shared publicly” workflow.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| report_id | uuid not null fk incident_reports(id) on delete cascade | |
| reviewer_user_id | uuid not null fk users(id) | |
| action | text not null | `verify`, `reject`, `request_more_info`, `escalate` |
| notes | text null | |
| reviewed_at | timestamptz not null default now() | |

### 11. alerts
Represents platform-generated alerts shown in feeds, dashboards, or sent to users. These are not raw weather records; they are actionable product-level events.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| source_type | text not null | `weather_api`, `community_report`, `soil_model`, `ai_rule`, `manual` |
| source_reference_id | uuid null | nullable because source may be external |
| alert_type | text not null | `flood`, `pest`, `fire`, `failed_rainfall`, `planting_window`, `disease`, `irrigation` |
| severity | text not null | `low`, `medium`, `high`, `critical` |
| title | text not null | |
| description | text not null | |
| location_name | text null | |
| farm_id | uuid null fk farms(id) | targeted alert |
| farm_section_id | uuid null fk farm_sections(id) | targeted alert |
| geo_point | geography(Point, 4326) null | regional alert target |
| probability_pct | numeric(5,2) null | useful for flood/forecast-driven alerts |
| confidence_pct | numeric(5,2) null | useful for AI advisories |
| status | text not null default `'active'` | `active`, `resolved`, `expired`, `dismissed` |
| starts_at | timestamptz null | |
| ends_at | timestamptz null | |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

### 12. user_notifications
Tracks what each user receives and whether it has been read.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid not null fk users(id) | |
| alert_id | uuid null fk alerts(id) | nullable if non-alert notification |
| notification_type | text not null | `in_app`, `email`, `sms`, `push` |
| title | text not null | |
| body | text not null | |
| is_read | boolean not null default false | |
| delivered_at | timestamptz null | |
| read_at | timestamptz null | |
| created_at | timestamptz not null default now() | |

### 13. ai_conversations
Supports persisted chat sessions in `AIAssistant`.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid not null fk users(id) | |
| farm_id | uuid null fk farms(id) | if conversation is farm-specific |
| title | text null | optional generated summary |
| status | text not null default `'active'` | |
| created_at | timestamptz not null default now() | |
| updated_at | timestamptz not null default now() | |

### 14. ai_messages
Stores the chat transcript if persistence is needed.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| conversation_id | uuid not null fk ai_conversations(id) on delete cascade | |
| role | text not null | `system`, `user`, `assistant`, `tool` |
| content | text not null | |
| model_name | text null | |
| related_farm_id | uuid null fk farms(id) | |
| created_at | timestamptz not null default now() | |

### 15. ai_recommendations
Stores structured outputs worth keeping after the chat or advisory engine produces them.

| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| user_id | uuid not null fk users(id) | |
| farm_id | uuid null fk farms(id) | |
| crop_cycle_id | uuid null fk crop_cycles(id) | |
| recommendation_type | text not null | `planting`, `irrigation`, `risk`, `soil`, `general` |
| title | text not null | |
| summary | text not null | |
| recommendation_payload | jsonb not null | structured explanation/metrics |
| confidence_pct | numeric(5,2) null | |
| valid_from | timestamptz null | |
| valid_until | timestamptz null | |
| created_at | timestamptz not null default now() | |

## Tables That Can Be Derived Instead Of Persisted
The current analytics UI can be produced from relational data and should not require separate permanent tables yet:
- monthly yield trend
- farm performance ranking
- crop distribution
- active alert counts
- average farm health
- average soil moisture

These should initially be built from SQL views or materialized views, not hand-maintained tables.

Suggested optional views:
- `vw_farm_latest_health`
- `vw_active_alert_counts`
- `vw_crop_distribution`
- `vw_monthly_yield`
- `vw_latest_soil_metrics_by_section`

## Tomorrow.io Data: What Should Not Be Stored
These values appear to be best consumed live from Tomorrow.io and not persisted in PostgreSQL:
- current weather on the dashboard weather widget
- short-range hourly and daily forecast values
- rainfall probability
- humidity
- wind speed
- real-time temperature
- live flood probability inputs
- transient climate values used only to render the current UI state

Reason:
- they are high-churn API values
- they become stale quickly
- storing every response would create unnecessary write volume
- most screens only need the latest answer, not permanent storage

## Tomorrow.io Data: What Can Be Stored Indirectly
Do not store the raw API payload by default, but it is reasonable to store product decisions derived from it:
- generated planting advisory records in `ai_recommendations`
- generated alerts in `alerts`
- notification delivery state in `user_notifications`
- optional small cache metadata outside the core domain tables

Example:
- fetch rainfall, humidity, and temperature from Tomorrow.io live
- compute “Delay cassava planting in Benue”
- store that decision as an advisory or alert
- do not store the full raw weather response unless historical audit is required

## Optional Weather Cache Layer
If performance becomes a concern, add a lightweight cache table with short retention. This is optional and should not become the source of truth.

### weather_api_cache
| Column | Type | Notes |
|---|---|---|
| id | uuid pk | |
| provider | text not null | e.g. `tomorrow_io` |
| cache_key | text unique not null | location + time window + fields |
| latitude | numeric(9,6) not null | |
| longitude | numeric(9,6) not null | |
| request_scope | text not null | `current`, `hourly`, `daily` |
| payload | jsonb not null | raw response |
| fetched_at | timestamptz not null | |
| expires_at | timestamptz not null | strict TTL |

Use this only when:
- rate limiting becomes a problem
- many users request the same location repeatedly
- you need a short-lived replay buffer

## Naming And Type Recommendations
- prefer `uuid` primary keys
- use `timestamptz` for all event times
- use `numeric` for coordinates, percentages, and agronomic values
- use `geography(Point, 4326)` for spatial search and regional matching
- use `jsonb` only for flexible derived payloads, not for core farm/report data

## Suggested Build Order
1. `users`
2. `user_preferences`
3. `farms`
4. `farm_sections`
5. `crop_cycles`
6. `soil_observations`
7. `incident_reports`
8. `incident_report_media`
9. `incident_report_reviews`
10. `alerts`
11. `user_notifications`
12. `ai_conversations`
13. `ai_messages`
14. `ai_recommendations`

## Minimum Viable Version
If you want to start lean, the minimum useful production schema is:
- `users`
- `user_preferences`
- `farms`
- `crop_cycles`
- `soil_observations`
- `incident_reports`
- `alerts`
- `user_notifications`
- `ai_conversations`
- `ai_messages`

## Final Recommendation
Use PostgreSQL as the system of record for:
- users
- farms
- crop lifecycle data
- soil history
- community reports
- reviews
- alerts
- notifications
- AI conversation history

Do not use PostgreSQL as the permanent store for raw Tomorrow.io live weather responses unless you later decide to support:
- historical weather analytics
- regulatory/audit replay
- incident forensics
- offline availability
- ML feature backfills
