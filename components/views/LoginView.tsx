import React, { useState, useEffect } from 'react';
import { useMemberContext } from '../../contexts/MemberContext';
import { useAppData } from '../../hooks/useAppData';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../Logo';

const LoginView: React.FC = () => {
    const { members } = useMemberContext();
    const { loadSampleData } = useAppData();
    const { login } = useAuth();
    const { themeConfig } = useTheme();
    
    const [selectedUser, setSelectedUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (members.length > 0 && !selectedUser) {
            setSelectedUser(members[0].name);
        }
    }, [members, selectedUser]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedUser) {
            setError('Please select a user.');
            return;
        }
        const success = login(selectedUser, password);
        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
    };

    const handleLoadSampleData = () => {
        loadSampleData(true);
    };

    const inputBaseStyle = `w-full p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`;
    const selectBaseStyle = `${inputBaseStyle} appearance-none`;


    return (
        <div className="w-full h-full flex flex-col items-center justify-center z-10 p-6">
            <div className={`w-full max-w-sm p-8 rounded-3xl ${themeConfig.cardBg} backdrop-blur-xl border border-white/10 flex flex-col items-center text-center shadow-2xl`}>
                <Logo className={`h-16 w-16 mb-4 ${themeConfig.textColor}`} />
                <h1 className={`text-3xl font-bold ${themeConfig.textColor}`}>Welcome Back</h1>
                <p className={`mt-2 ${themeConfig.subtextColor}`}>Select your profile to continue.</p>

                {members.length > 0 ? (
                    <form onSubmit={handleLogin} className="w-full mt-8 space-y-4">
                        <div className="relative">
                            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className={selectBaseStyle}>
                                {members.map(m => <option key={m.id} value={m.name}>{m.name} ({m.role})</option>)}
                            </select>
                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${themeConfig.textColor}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                        
                        <input 
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputBaseStyle}
                        />

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <p className={`text-xs ${themeConfig.subtextColor}`}>Hint: the password is "password" for all sample users.</p>

                        <button 
                            type="submit"
                            className={`w-full py-3.5 rounded-xl font-semibold text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-shadow`}
                        >
                            Login
                        </button>
                    </form>
                ) : (
                    <div className="w-full mt-8 text-center">
                        <p className={`${themeConfig.subtextColor} mb-4`}>
                            No users found. Load the sample data to get started.
                        </p>
                        <button 
                            onClick={handleLoadSampleData}
                            className={`w-full py-3.5 rounded-xl font-semibold text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-shadow`}
                        >
                            Load Sample Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginView;