import {
  BanknotesIcon,
  ChartPieIcon,
  EnvelopeIcon,
  HomeIcon,
  PhotoIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddArtistModal from "./AddArtistModal";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useArtists } from "@/context/mainContext";
import { Artist } from "@/types/artist.type"; 

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const { artists, isModalOpen, setIsModalOpen, selectedArtist, setSelectedArtist, currentId, switchArtist, counters } = useArtists();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    signOut();
    toast.success("Sikeres kijelentkezés!");
  };

  useEffect(() => {
    if (!router.query.id) {
      if (artists !== null) {
        setIsModalOpen(true);
      }
    }
  }, [router.query.id]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push("/dashboard/profile");
  };

  const navigation = [
    {
      name: "Főoldal",
      path: `/dashboard/${currentId}`,
      icon: HomeIcon,
      current: false,
    },
    {
      name: "Üzenetek",
      path: `/dashboard/${currentId}/messages`,
      icon: EnvelopeIcon,
      count: 'messages',
      current: false,
    },
    {
      name: "Hirdetések",
      path: `/dashboard/${currentId}/ads`,
      icon: BanknotesIcon,
      count: 'ads',
      current: false,
    },
    {
      name: "Profil",
      path: `/dashboard/${currentId}/profile`,
      icon: PhotoIcon,
      current: false,
    },
    {
      name: "Beállítások",
      path: `/dashboard/${currentId}/settings`,
      icon: ChartPieIcon,
      current: false,
    },
  ];

  const handleAddArtist = (artistData: { name: string; concept: string; location: string; bio: string }) => {

  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span className="sr-only">{isMobileMenuOpen ? 'Close sidebar menu' : 'Open sidebar menu'}</span>
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={classNames(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex grow min-w-[250px] max-w-[250px] h-screen max-h-screen flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <img
              alt="Your Company"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={classNames(
                          router.asPath === item.path
                            ? "bg-gray-50 text-indigo-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          "group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                        )}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            router.asPath === item.path
                              ? "text-indigo-600"
                              : "text-gray-400 group-hover:text-indigo-600",
                            "size-6 shrink-0"
                          )}
                        />
                        {item.name}
                        {counters[item.count as keyof typeof counters] > 0 ? (
                          <span
                            aria-hidden="true"
                            className="ml-auto w-9 min-w-max rounded-full bg-red-100 px-2.5 py-0.5 text-center text-xs/5 font-medium whitespace-nowrap text-red-700 ring-1 ring-red-200 ring-inset"
                          >
                            {counters[item.count as keyof typeof counters]}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs/6 font-semibold text-gray-400">
                  Your artist profiles
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1 w-full">
                  {artists && artists.map((artist) => (
                    <li key={artist.name} className="cursor-pointer w-full">
                      <button
                        onClick={() => {
                          switchArtist(artist._id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={classNames(
                          selectedArtist === artist._id
                            ? "bg-gray-50 text-indigo-600"
                            : 
                            "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                          "group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                        )}
                      >
                        <span
                          className={classNames(
                            selectedArtist === artist._id
                              ? "border-indigo-600 text-indigo-600"
                              : 
                              "border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600",
                            "flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium"
                          )}
                        >
                          {artist.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="truncate">{artist.name}</span>
                      </button>
                    </li>
                  ))}
                  <li className="cursor-pointer w-full">
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      data-add-artist-button
                      className="text-gray-700 hover:bg-gray-50 hover:text-indigo-600 group flex w-full gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
                    >
                      <span
                        className={classNames(
                          "border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600",
                          "flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium"
                        )}
                      >
                        +
                      </span>
                      <span className="truncate">Add new artist</span>
                    </button>
                  </li>
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-8 rounded-full bg-gray-50"
                  />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">Tom Cook</span>
                </a>
              </li>

              <li>
                <button onClick={handleLogout} className="text-black p-2 rounded-md">Logout</button>
              </li>
            </ul>
          </nav>

          <AddArtistModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onAddArtist={handleAddArtist}
          />
        </div>
      </div>
    </>
  );
}
