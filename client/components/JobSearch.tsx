"use client"

import { useState } from 'react';

interface JobSearchProps {
    onSearch: (params: { title: string; company: string }) => void;
}

export default function JobSearch({ onSearch }: JobSearchProps) {
    const [title, setTitle] = useState("")
    const [company, setCompany] = useState("airbnb")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ title, company });
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                    </label>
                    <select
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="airbnb">Airbnb</option>
                        <option value="stripe">Stripe</option>
                        <option value="coinbase">Coinbase</option>
                        <option value="robinhood">Robinhood</option>
                        <option value="gusto">Gusto</option>
                        <option value="brex">Brex</option>
                    </select>
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title (optional)
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. engineer, designer, analyst"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search Jobs
                    </button>
                </div>
            </div>
        </form>
    );
}