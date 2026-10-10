import { toast } from "sonner";

interface LocationSuccess {
  latitude: string;
  longitude: string;
}

export async function getCurrentLocation(): Promise<LocationSuccess> {

  return new Promise((resolve, reject) => {

    if (!("geolocation" in navigator)) {

      toast.error(
        "Geolocation is not supported by your browser"
      );

      reject(
        new Error("Geolocation not supported")
      );

      return;
    }

    toast.info("Getting your location...");

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const location = {

          latitude:
            position.coords.latitude.toFixed(6),

          longitude:
            position.coords.longitude.toFixed(6),
        };

        toast.success(
          "Location captured successfully!"
        );

        resolve(location);
      },

      (error) => {

        console.error(error);

        toast.error(
          "Unable to get location. Please enter manually."
        );

        reject(error);
      }
    );
  });
}