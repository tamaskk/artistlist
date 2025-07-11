import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Artist } from "@/types/artist.type";
import { getArtists, getCurrentArtist, getActiveAdsCount } from "@/service/artist.service";
import { getUnreadCount } from "@/service/message.service";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

// Simple client-side validation for MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

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
  // Counter functionality
  counters: {
    messages: number;
    ads: number;
  };
  fetchCounters: () => Promise<void>;
  refreshCounters: () => Promise<void>;
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
  const [counters, setCounters] = useState<{
    messages: number;
    ads: number;
  }>({ 
    messages: 0,
    ads: 0,
  });
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const currentId = router.query.id;
  
  useEffect(() => {
    if (router.query.id && session) {
      getArtist(router.query.id as string);
    }
  }, [router.query.id, session]);

  // Fetch artists only when user is authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchArtists();
    } else if (status === "unauthenticated") {
      // Clear artists when user is not authenticated
      setArtists(null);
      setCurrentArtist(null);
      setCounters({ messages: 0, ads: 0 });
    }
  }, [status, session]);

  // Fetch counters when artists are loaded
  useEffect(() => {
    if (artists && artists.length > 0) {
      fetchCounters();
      
      // Set up interval to refresh counters every 30 seconds
      const interval = setInterval(fetchCounters, 30000);
      
      return () => clearInterval(interval);
    }
  }, [artists]);

  const getArtist = async (id: string) => {
    // Check if the id is a valid object id
    if (isValidObjectId(id)) {
      try {
        const response = await getCurrentArtist(id);
        setCurrentArtist(response.artist);
      } catch (error) {
        console.error("Error fetching artist:", error);
        // If there's an error fetching the artist, redirect to dashboard
        router.push("/dashboard");
      }
    } else {
      // If the id is not a valid object id, redirect to the dashboard
      router.push("/dashboard");
    }
  };

  const fetchArtists = async () => {
    // Only fetch if user is authenticated
    if (status !== "authenticated" || !session) {
      return;
    }

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

  const fetchCounters = async () => {
    try {
      // Fetch unread messages count
      const unreadResponse = await getUnreadCount();
      if (unreadResponse.ok) {
        setCounters(prev => ({
          ...prev,
          messages: unreadResponse.unreadCount
        }));
      }

      // Fetch active ads count
      const adsResponse = await getActiveAdsCount();
      if (adsResponse.ok) {
        setCounters(prev => ({
          ...prev,
          ads: adsResponse.activeAdsCount
        }));
      }
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  };

  const refreshCounters = async () => {
    await fetchCounters();
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
    counters,
    fetchCounters,
    refreshCounters,
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
