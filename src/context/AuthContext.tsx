// Importing React Hooks
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Axios
import axios from "axios";

import api, {
  initializeCsrfProtection,
} from "../lib/api";

/*
|--------------------------------------------------------------------------
| USER PROFILE
|--------------------------------------------------------------------------
*/

export interface AuthUserProfile {
  id?: string;

  organization_name?: string | null;

  phone?: string | null;

  role?: string | null;

  status?: string | null;
}

/*
|--------------------------------------------------------------------------
| PENDING EMAIL CHANGE
|--------------------------------------------------------------------------
*/

export interface PendingEmailChange {
  id: number;

  new_email: string;
  requires_email_verification: boolean;
}

/*
|--------------------------------------------------------------------------
| AUTH USER
|--------------------------------------------------------------------------
*/

export interface AuthUser {
  id: number;

  name: string;

  email: string;

  email_verified_at?: string | null;

  pendingEmailChange?: PendingEmailChange | null;

  profile?: AuthUserProfile | null;
}

/*
|--------------------------------------------------------------------------
| LOGIN PAYLOAD
|--------------------------------------------------------------------------
*/

export interface LoginPayload {
  email: string;

  password: string;
}

/*
|--------------------------------------------------------------------------
| REGISTER PAYLOAD
|--------------------------------------------------------------------------
*/

export interface RegisterPayload {
  name: string;

  email: string;

  password: string;

  password_confirmation: string;
}

/*
|--------------------------------------------------------------------------
| REGISTER RESPONSE
|--------------------------------------------------------------------------
*/

export interface RegisterResponse {
  message: string;

  otp?: string;
}

/*
|--------------------------------------------------------------------------
| VALIDATION ERRORS
|--------------------------------------------------------------------------
*/

export interface AuthValidationErrors {
  [key: string]: string[] | undefined;
}

/*
|--------------------------------------------------------------------------
| CONTEXT CONTRACT
|--------------------------------------------------------------------------
*/

interface AuthContextValue {

  user: AuthUser | null;

  isAuthenticated: boolean;

  isBootstrappingAuth: boolean;
  

  login: (
    payload: LoginPayload
  ) => Promise<AuthUser>;

  register: (
    payload: RegisterPayload
  ) => Promise<RegisterResponse>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<AuthUser | null>;

  setUser: React.Dispatch<
    React.SetStateAction<AuthUser | null>
  >;
}

/*
|--------------------------------------------------------------------------
| LARAVEL AUTH RESPONSE
|--------------------------------------------------------------------------
*/

interface LaravelAuthResponse {
  message: string;

  user: AuthUser;
}

/*
|--------------------------------------------------------------------------
| VALIDATION ERROR RESPONSE
|--------------------------------------------------------------------------
*/

interface LaravelValidationErrorResponse {
  message?: string;

  errors?: AuthValidationErrors;
}

/*
|--------------------------------------------------------------------------
| CREATE CONTEXT
|--------------------------------------------------------------------------
*/

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

/*
|--------------------------------------------------------------------------
| AXIOS ERROR GUARD
|--------------------------------------------------------------------------
*/

function isAxiosErrorWithResponse(
  error: unknown
): error is {
  response: {
    status: number;

    data?: LaravelValidationErrorResponse;
  };
} {

  return (
    axios.isAxiosError(error) &&
    Boolean(error.response)
  );
}

/*
|--------------------------------------------------------------------------
| AUTH PROVIDER
|--------------------------------------------------------------------------
*/

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [
    isBootstrappingAuth,
    setIsBootstrappingAuth,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | REFRESH USER
  |--------------------------------------------------------------------------
  */

  async function refreshUser() {

    try {

      const response =
        await api.get<AuthUser>(
          "/api/user"
        );

      setUser(response.data);

      return response.data;

    } catch (error) {

      if (
        isAxiosErrorWithResponse(error) &&
        (
          error.response.status === 401 ||
          error.response.status === 419
        )
      ) {

        setUser(null);

        return null;
      }

      throw error;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  async function login(
    payload: LoginPayload
  ) {

    await initializeCsrfProtection();

    const response =
      await api.post<LaravelAuthResponse>(
        "/api/login",
        payload
      );

    setUser(response.data.user);

    return response.data.user;
  }

  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  async function register(
    payload: RegisterPayload
  ) {

    await initializeCsrfProtection();

    const response =
      await api.post<RegisterResponse>(
        "/api/register",
        payload
      );

    // IMPORTANT:
    // Registration no longer authenticates user.
    // It only sends OTP.

    return response.data;
  }

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  async function logout() {

    await initializeCsrfProtection();

    await api.post("/api/logout");

    const authenticatedUser =
      await refreshUser();

    if (authenticatedUser) {

      throw new Error(
        "There was an error logging you out, try again!"
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | BOOTSTRAP AUTH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let isMounted = true;

    async function bootstrapAuth() {

      try {

        const authenticatedUser =
          await refreshUser();

        if (!isMounted) {
          return;
        }

        setUser(authenticatedUser);

      } catch (error) {

        if (isMounted) {

          setUser(null);
        }

        console.error(
          "Unable to bootstrap authenticated user.",
          error
        );

      } finally {

        if (isMounted) {

          setIsBootstrappingAuth(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };

  }, []);

  /*
  |--------------------------------------------------------------------------
  | MEMOIZED CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        setUser,

        isAuthenticated:
          user !== null,

        isBootstrappingAuth,

        login,

        register,

        logout,

        refreshUser,
      }),

      [
        user,
        isBootstrappingAuth,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | PROVIDER
  |--------------------------------------------------------------------------
  */

  return (

    <AuthContext.Provider value={value}>

      {children}

    </AuthContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| USE AUTH
|--------------------------------------------------------------------------
*/

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}

/*
|--------------------------------------------------------------------------
| API ERROR MESSAGE
|--------------------------------------------------------------------------
*/

export function getApiErrorMessage(
  error: unknown
) {

  if (
    isAxiosErrorWithResponse(error)
  ) {

    return (
      error.response.data?.message ??
      "Something went wrong."
    );
  }

  if (error instanceof Error) {

    return error.message;
  }

  return "Something went wrong.";
}

/*
|--------------------------------------------------------------------------
| VALIDATION ERRORS
|--------------------------------------------------------------------------
*/

export function getApiValidationErrors(
  error: unknown
) {

  if (
    isAxiosErrorWithResponse(error)
  ) {

    return (
      error.response.data?.errors ?? {}
    );
  }

  return {};
}