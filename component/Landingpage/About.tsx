'use client'

import React from 'react'
import { 
  MusicalNoteIcon, 
  BuildingStorefrontIcon, 
  UserGroupIcon, 
  HeartIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function About() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-gradient-to-tr from-purple-400 via-pink-500 to-red-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        
        <div className="mx-auto max-w-4xl py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              About ArtistList
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              We're on a mission to bridge the gap between talented artists and vibrant venues, 
              creating opportunities for live music and entertainment that enrich our communities.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Mission
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                ArtistList is dedicated to connecting talented musicians, performers, and artists 
                with bars, restaurants, and venues that are looking to enhance their atmosphere 
                with live entertainment. We believe that live music has the power to transform 
                spaces and create unforgettable experiences for both artists and audiences.
              </p>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Our platform serves as the bridge between creative talent and business opportunities, 
                making it easier than ever for artists to find gigs and for venues to discover 
                amazing performers.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 p-8">
                <div className="flex items-center justify-center h-full">
                  <SparklesIcon className="h-32 w-32 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What Users Can Do Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 bg-white/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What You Can Do
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Whether you're an artist looking for opportunities or a venue seeking talent, 
            ArtistList provides the tools and connections you need.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {/* For Artists */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <MusicalNoteIcon className="h-5 w-5 flex-none text-purple-600" aria-hidden="true" />
                For Artists
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Create your artist profile, showcase your talent, and connect with venues 
                  looking for performers. Browse available gigs, manage your bookings, and 
                  grow your network in the local music scene.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-pink-500" />
                    <span>Build your professional profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-pink-500" />
                    <span>Discover gig opportunities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-pink-500" />
                    <span>Connect with venue owners</span>
                  </li>
                </ul>
              </dd>
            </div>

            {/* For Venues */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <BuildingStorefrontIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                For Venues
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Find talented artists to enhance your venue's atmosphere. Post gig opportunities, 
                  browse artist profiles, and book performers that match your venue's style and audience.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-blue-500" />
                    <span>Post gig opportunities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-blue-500" />
                    <span>Browse artist portfolios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-blue-500" />
                    <span>Book performers easily</span>
                  </li>
                </ul>
              </dd>
            </div>

            {/* For Music Lovers */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <UserGroupIcon className="h-5 w-5 flex-none text-green-600" aria-hidden="true" />
                For Music Lovers
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Discover amazing live music in your area. Find venues with great entertainment, 
                  follow your favorite artists, and never miss a show in your local music scene.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-green-500" />
                    <span>Discover local talent</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-green-500" />
                    <span>Find venues with live music</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartIcon className="h-4 w-4 text-green-500" />
                    <span>Stay updated on events</span>
                  </li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Goals Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 p-8">
                <div className="flex items-center justify-center h-full">
                  <GlobeAltIcon className="h-32 w-32 text-blue-600" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Goals
              </h2>
              <div className="mt-6 space-y-6 text-lg leading-8 text-gray-600">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Foster Local Music Communities</h3>
                    <p>Create vibrant, connected music scenes where artists and venues thrive together.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Support Artist Growth</h3>
                    <p>Provide artists with opportunities to perform, build their audience, and earn a living doing what they love.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enhance Venue Experiences</h3>
                    <p>Help venues create memorable experiences for their customers through quality live entertainment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Build Lasting Connections</h3>
                    <p>Create a platform where meaningful relationships between artists, venues, and audiences can flourish.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto w-screen px-6 lg:px-8 py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg leading-8 text-purple-100">
            Join our community of artists and venues today. Whether you're looking to perform 
            or host live music, we're here to help you connect and succeed.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/artists"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Browse Artists
            </a>
            <a
              href="/contact"
              className="text-sm font-semibold text-white hover:text-purple-100 transition-colors"
            >
              Contact Us <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 