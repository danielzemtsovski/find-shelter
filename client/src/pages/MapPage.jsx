import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Loader2, Target } from "lucide-react";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import useShelterStore from "../store/useStoreShelter";

let usertIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

let shelterIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

function RecenterAutomatically({ position, isAutoCenter, setIsAutoCenter }) {
    const map = useMap();

    useEffect(() => {
        const onScroll = () => {
            setIsAutoCenter(false);
        };

        map.on("dragstart", onScroll);
        map.on("zoomstart", onScroll)
        return () => {
            map.off("dragstart", onScroll);
            map.off("zoomstart", onScroll);
        };
    }, [map, setIsAutoCenter])

    useEffect(() => {
        if (isAutoCenter && position) {
            map.flyTo(position,
                map.getZoom(), {
                animate: true,
                duration: 1.5
            });
        }
    }, [position, map, isAutoCenter]);

    return null;
}

const getUserLocation = () => {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => resolve([coords.latitude, coords.longitude]),
            () => resolve([32.0853, 34.7818]),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
};

function MapPage() {
    const [myPosition, setMyPosition] = useState([32.0853, 34.7818]);
    const [loading, setLoading] = useState(true);
    const [isAutoCenter, setIsAutoCenter] = useState(true);
    const { shelters, loadShelters } = useShelterStore();

    useEffect(() => {
        const fetchData = async () => {
            await loadShelters();
        };

        fetchData().catch(console.error);
    }, [loadShelters]);

    useEffect(() => {
        let isPageActive = true;

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        const success = ({ coords }) => {
            if (isPageActive) {
                setMyPosition([coords.latitude, coords.longitude]);
                setLoading(false);
            }
        };

        const error = (err) => {
            console.error("שגיאת GPS:", err);
            setLoading(false);
        };

        const watcherId = navigator.geolocation.watchPosition(success, error, options);

        return () => {
            isPageActive = false;
            navigator.geolocation.clearWatch(watcherId);
        };
    }, []);



    const handleNavigate = (lat, lon) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
        window.open(url, "_blank");
    };

    return (
        <div className="mapContainer">
            {loading ? (
                <>
                    <Loader2 className="spinner" size={40} color="crimson" />
                    <p className="loadingText">מאתר את המיקום שלך...</p>
                </>
            ) : (
                <div className="mapDiv">
                    <MapContainer
                        center={myPosition}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="leaflet-container"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <RecenterAutomatically
                            position={myPosition}
                            isAutoCenter={isAutoCenter}
                            setIsAutoCenter={setIsAutoCenter}
                        />

                        <Marker position={myPosition} icon={usertIcon}>
                            <Popup>אתה נמצא כאן!</Popup>
                        </Marker>

                        {shelters && shelters.map((shelter) => (
                            <Marker
                                key={shelter._id}
                                position={[shelter.lat, shelter.lon]}
                                icon={shelterIcon}
                            >
                                <Popup>
                                    <div className="shelterPopupDiv">
                                        <h4 className="shelterTitle">מקלט ציבורי</h4>
                                        {shelter.distanceInMeters && (
                                            <p className="shelterDistance">מרחק: {shelter.distanceInMeters} מטרים</p>
                                        )}
                                        <button
                                            className="shelterButton"
                                            onClick={() => handleNavigate(shelter.lat, shelter.lon)}>
                                            נווט ברגל 🏃‍♂️
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                    <button
                        className={`recenterButton ${isAutoCenter ? "active" : ""}`}
                        onClick={() => setIsAutoCenter(true)}
                    >
                        חזרה למקום שלי
                        <Target size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default MapPage;
