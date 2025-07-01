import React, { useState, useEffect, useRef } from 'react';
import { addAd, getAd } from '@/service/artist.service';
import { useRouter } from 'next/router';
import { Ad } from '@/types/ads.type';
import { useArtists } from '@/context/mainContext';

const DAILY_FEE = 5; // 5 euros per day

const Ads = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showNewAdForm, setShowNewAdForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    durationType: 'days' as 'days' | 'date',
    duration: 7,
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    budget: 0,
  });
  const router = useRouter();
  const { id: artistId } = router.query;
  const hasFetchedAds = useRef(false);
  const { refreshCounters } = useArtists();

  // Check if there's an active campaign
  const hasActiveCampaign = Array.isArray(ads) && ads.some((ad: any) => ad?.status === 'running');

  // Calculate total price whenever duration or end date changes
  useEffect(() => {
    let days = 0;
    if (newAd.durationType === 'days') {
      days = newAd.duration;
    } else {
      const start = new Date();
      const end = new Date(newAd.endDate);
      days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    setNewAd(prev => ({ ...prev, budget: days * DAILY_FEE }));
  }, [newAd.duration, newAd.endDate, newAd.durationType]);

  // Check for completed campaigns
  useEffect(() => {
    const now = new Date();
    setAds((currentAds: any) => 
      currentAds.map((ad: any) => {
        if (ad.status === 'active' && ad.endDate < now) {
          return { ...ad, status: 'completed' };
        }
        return ad;
      })
    );
  }, []);

  const createNewAd = async () => {
    if (hasActiveCampaign) {
      alert('You can only have one active campaign at a time. Please wait for your current campaign to complete.');
      return;
    }

    const startDate = new Date();
    const endDate = newAd.durationType === 'days' 
      ? new Date(new Date().setDate(startDate.getDate() + newAd.duration))
      : new Date(newAd.endDate);
      
      alert(artistId);
    const response = await addAd(artistId as string, newAd.duration, endDate, newAd.title);

    if (response.ok) {
      const ad = {
        _id: response.insertedId,
        title: newAd.title,
        startDate,
        endDate,
        budget: newAd.budget,
        spent: 0,
        clicks: 0,
        status: 'active',
      };

      setAds([...ads, ad] as any);
      setShowNewAdForm(false);
      setNewAd({
        title: '',
        durationType: 'days',
        duration: 7,
        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        budget: 0,
      });
      
      // Refresh counters to update active ads count in sidebar
      await refreshCounters();
    }
  };

  const getDaysRemaining = (endDate: Date | string) => {
    const now = new Date();
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  const calculateBudgetSpent = (ad: Ad) => {
    const now = new Date();
    const startDate = typeof ad.createdAt === 'string' ? new Date(ad.createdAt) : ad.createdAt;
    const endDate = typeof ad.adEndDate === 'string' ? new Date(ad.adEndDate) : ad.adEndDate;
    
    // If campaign is completed, return full budget
    if (ad.status === 'completed' || now > endDate) {
      return ad.adDays * DAILY_FEE;
    }
    
    // Calculate days elapsed since start
    const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsedClamped = Math.max(0, Math.min(daysElapsed, ad.adDays));
    
    return daysElapsedClamped * DAILY_FEE;
  };

  const calculateTotalBudget = (ad: Ad) => {
    return ad.adDays * DAILY_FEE;
  };

  useEffect(() => {
    const fetchAds = async () => {
      if (artistId && !hasFetchedAds.current) {
        hasFetchedAds.current = true;
        try {
          const response = await getAd(artistId as string);
          if (response.ok && response.ad) {
            // Convert single ad to array or use empty array if no ads
            setAds(Array.isArray(response.ad) ? response.ad : [response.ad]);
          } else {
            setAds([]);
          }
        } catch (error) {
          console.error('Error fetching ads:', error);
          setAds([]);
        }
      }
    };
    fetchAds();
  }, [artistId]);

  return (
    <div className="bg-white max-h-screen overflow-y-auto p-4 w-full">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="border-b border-gray-900/10 pb-12">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900">Advertisement Campaign</h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                {hasActiveCampaign 
                  ? "Your campaign is currently running. Once started, campaigns run until completion."
                  : "Create a new campaign to increase your profile visibility."}
              </p>
            </div>
            {!hasActiveCampaign && (
              <button
                onClick={() => setShowNewAdForm(true)}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
              >
                Create New Campaign
              </button>
            )}
          </div>

          {/* New Ad Form */}
          {showNewAdForm && !hasActiveCampaign && (
            <div className="mt-6 p-6 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Advertisement</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="ad-title" className="block text-sm font-medium text-black">
                    Ad Title
                  </label>
                  <input
                    type="text"
                    id="ad-title"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                    placeholder="Enter ad title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Ad Duration
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={newAd.durationType === 'days'}
                        onChange={() => setNewAd({ ...newAd, durationType: 'days' })}
                        className="form-radio text-indigo-600"
                      />
                      <span className="ml-2 text-black">Number of Days</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={newAd.durationType === 'date'}
                        onChange={() => setNewAd({ ...newAd, durationType: 'date' })}
                        className="form-radio text-indigo-600"
                      />
                      <span className="ml-2 text-black">End Date</span>
                    </label>
                  </div>

                  {newAd.durationType === 'days' ? (
                    <div>
                      <label htmlFor="ad-duration" className="block text-sm font-medium text-black">
                        Number of Days
                      </label>
                      <select
                        id="ad-duration"
                        value={newAd.duration}
                        onChange={(e) => setNewAd({ ...newAd, duration: parseInt(e.target.value) })}
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                      >
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="ad-end-date" className="block text-sm font-medium text-black">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="ad-end-date"
                        value={formatDate(newAd.endDate)}
                        min={formatDate(new Date())}
                        onChange={(e) => setNewAd({ ...newAd, endDate: new Date(e.target.value) })}
                        className="mt-1 block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Price Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Daily Fee:</span>
                      <span className="text-gray-900">€{DAILY_FEE.toFixed(2)} per day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="text-gray-900">
                        {newAd.durationType === 'days' 
                          ? `${newAd.duration} days`
                          : `${Math.ceil((newAd.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                        }
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-900">Total Price:</span>
                        <span className="text-indigo-600">€{newAd.budget.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowNewAdForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNewAd}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500"
                  >
                    Create Ad
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Campaign Section */}
        <div className="border-b border-gray-900/10 pb-12">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            {hasActiveCampaign ? "Current Campaign" : "Campaign Status"}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {ads.map((ad) => (
              <div key={ad._id} className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{ad.title}</h4>
                    <p className="text-sm text-gray-500">
                      Started on {formatDate(ad.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ad.status === 'running' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.status === 'running' ? 'Running' : 'Completed'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Days Remaining</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {ad.status === 'running' ? getDaysRemaining(ad.adEndDate) : 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Profile Clicks</p>
                    <p className="text-2xl font-semibold text-gray-900">{ad.clickCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Budget Spent</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      €{calculateBudgetSpent(ad).toFixed(2)} / €{calculateTotalBudget(ad).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Campaign Progress</span>
                    <span>
                      {ad.status === 'running' 
                        ? `${Math.round((calculateBudgetSpent(ad) / calculateTotalBudget(ad)) * 100)}%`
                        : '100%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        ad.status === 'running' ? 'bg-indigo-600' : 'bg-gray-600'
                      }`}
                      style={{ 
                        width: `${ad.status === 'running' 
                          ? Math.min((calculateBudgetSpent(ad) / calculateTotalBudget(ad)) * 100, 100)
                          : 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}

            {!hasActiveCampaign && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No active campaign</p>
                <button
                  onClick={() => setShowNewAdForm(true)}
                  className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Start your first campaign
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics Section */}
        {hasActiveCampaign && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Campaign Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-500">Total Profile Clicks</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {ads[0].clickCount}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-500">Total Budget Spent</p>
                <p className="text-3xl font-semibold text-gray-900">
                  €{ads.reduce((sum, ad) => sum + calculateBudgetSpent(ad), 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-500">Days Remaining</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {ads.find(ad => ad.status === 'running') 
                    ? getDaysRemaining(ads.find(ad => ad.status === 'running')!.adEndDate)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ads;
