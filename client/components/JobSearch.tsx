"use client"

import { useState } from 'react';

interface JobSearchProps {
    onSearch: (params: { title: string; location: string; seniority: string }) => void;
}

export default function JobSearch({ onSearch }: JobSearchProps) {
    const [title, setTitle] = useState("")
    const [location, setLocation] = useState("")
    const [seniority, setSeniority] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ title, location, seniority });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. San Francisco"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seniority
                    </label>
                    <input
                        type="text"
                        value={seniority}
                        onChange={(e) => setSeniority(e.target.value)}
                        placeholder="e.g. Senior"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </button>
                </div>
            </div>
        </form>
    );
}