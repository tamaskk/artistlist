import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Artist } from "@/types/artist.type";
import { getArtists, getCurrentArtist } from "@/service/artist.service";
import { useRouter } from "next/router";

// Define the shape of our context
interface ArtistContextType {
  artists: Artist[] | null;
  setArtists: (artists: Artist[] | null) => void;
  fetchArtists: () => Promise<void>;
  isLoading: boolean;
  currentArtist: Artist | null;
  setCurrentArtist: (artist: Artist | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  addArtist: (artist: Partial<Artist>) => void;
  selectedArtist: string | null;
  setSelectedArtist: (artist: string | null) => void;
  switchArtist: (id: string) => void;
  currentId: string | null;
}

// Create the context with a default value
const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

// Create a provider component
interface ArtistProviderProps {
  children: ReactNode;
}

export const ArtistProvider: React.FC<ArtistProviderProps> = ({ children }) => {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentArtist, setCurrentArtist] = useState<Artist | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  
  const router = useRouter();
  const currentId = router.query.id;
  
  useEffect(() => {
    if (router.query.id) {
      getArtist(router.query.id as string);
    }
  }, [router.query.id]);

  // Fetch artists on initial load
  useEffect(() => {
    fetchArtists();
  }, []);

  const getArtist = async (id: string) => {
    const response = await getCurrentArtist(id);
    setCurrentArtist(response.artist);
  };

  const fetchArtists = async () => {
    setIsLoading(true);
    try {
      const response = await getArtists();
      if (response.ok) {
        setArtists(response.artists);
        // If we have a current artist ID in the URL, make sure we have that artist's data
        if (router.query.id) {
          const artistExists = response.artists.some(artist => artist._id === router.query.id);
          if (!artistExists) {
            // If the artist doesn't exist in our list, fetch it individually
            await getArtist(router.query.id as string);
          } else {
            // If it exists in our list, set it as current
            const artist = response.artists.find(artist => artist._id === router.query.id);
            if (artist) {
              setCurrentArtist(artist);
            }
          }
        }
        // If no artists are found and user is on a dashboard route, redirect to the dashboard and open the artist creation modal
        if (
          response.artists.length === 0 &&
          router.pathname.startsWith("/dashboard") &&
          router.pathname !== "/dashboard/profile"
        ) {
          router.push("/dashboard/profile");
          // We'll use a small timeout to ensure the modal component is mounted
          setTimeout(() => {
            const addArtistButton = document.querySelector(
              "[data-add-artist-button]"
            );
            if (addArtistButton instanceof HTMLElement) {
              addArtistButton.click();
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addArtist = async (artist: Partial<Artist>) => {
    setArtists([...(artists || []), artist as Artist]);
  };

  const switchArtist = (id: string) => {
    // Get the current path segments
    const pathSegments = router.asPath.split('/');
    // Find the index of the artist ID in the path
    const artistIdIndex = pathSegments.findIndex(segment => segment === currentId);
    
    if (artistIdIndex !== -1) {
      // Replace the artist ID at its position
      pathSegments[artistIdIndex] = id;
      // Join the path back together
      const newPath = pathSegments.join('/');
      
      setSelectedArtist(id);
      router.push(newPath);
    }
  };

  const value = {
    artists,
    setArtists,
    fetchArtists,
    isLoading,
    currentArtist,
    setCurrentArtist,
    isModalOpen,
    setIsModalOpen,
    addArtist,
    selectedArtist,
    setSelectedArtist,
    switchArtist,
    currentId: currentId as string | null,
  };

  return (
    <ArtistContext.Provider value={value}>{children}</ArtistContext.Provider>
  );
};

// Custom hook to use the artist context
export const useArtists = () => {
  const context = useContext(ArtistContext);
  if (context === undefined) {
    throw new Error("useArtists must be used within an ArtistProvider");
  }
  return context;
};
