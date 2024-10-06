"use client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import L from "leaflet";
import axios from "axios";

// Custom marker icon
const customMarkerIcon = new L.Icon({
  iconUrl: "/path-to-your-custom-marker-image.png", // Replace this with the correct path to your custom marker image
  iconSize: [40, 40], // Size of the icon
  iconAnchor: [20, 40], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -40], // Point from which the popup should open relative to the iconAnchor
});

// Function to handle map updates when the marker changes
const UpdateMapCenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15); // Center map on marker coordinates
    }
  }, [lat, lng, map]);
  return null;
};

const GoogleMaps = () => {
  const [postalPin, setPostalPin] = useState("");
  const [patientName, setPatientName] = useState("");
  const [diseaseName, setDiseaseName] = useState("");
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );

  const geocodePostalPin = async (postalPin: string) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: postalPin,
            format: "json",
          },
        }
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      } else {
        alert("Postal pin not found");
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    }
    return null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const coordinates = await geocodePostalPin(postalPin);
    if (coordinates) {
      setMarkerPosition([coordinates.lat, coordinates.lng]);
    }
  };

  return (
    <div className="flex">
      {/* Map Container */}
      <div className="h-[600px] w-2/3">
        <MapContainer
          center={[39.60128890889341, -9.069839810859907]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {markerPosition && (
            <>
              <Marker position={markerPosition} icon={customMarkerIcon} />
              <UpdateMapCenter
                lat={markerPosition[0]}
                lng={markerPosition[1]}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Form Container */}
      <div className="w-1/3 p-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="patient-name">Patient Name</label>
            <Input
              id="patient-name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="disease-name">Disease Name</label>
            <Input
              id="disease-name"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              placeholder="Enter disease name"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="postal-pin">Postal Pin</label>
            <Input
              id="postal-pin"
              value={postalPin}
              onChange={(e) => setPostalPin(e.target.value)}
              placeholder="Enter postal pin"
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GoogleMaps;
