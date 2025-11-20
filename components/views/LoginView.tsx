
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Logo from '../Logo';

const LoginView: React.FC = () => {
    const { login } = useAuth();
    const { themeConfig } = useTheme();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username.trim()) {
            setError('Please enter a username.');
            setIsLoading(false);
            return;
        }
        
        const success = await login(username, password);
        if (!success) {
            setError('Invalid credentials. Please try again.');
        }
        setIsLoading(false);
    };

    const inputBaseStyle = `w-full p-3.5 rounded-xl bg-black/20 ${themeConfig.textColor} placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 border-2 border-transparent focus:border-accent`;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center z-10 p-6">
            <div className={`w-full max-w-sm p-8 rounded-3xl ${themeConfig.cardBg} backdrop-blur-xl border border-white/10 flex flex-col items-center text-center shadow-2xl`}>
                <Logo className={`h-16 w-16 mb-4 ${themeConfig.textColor}`} />
                <h1 className={`text-3xl font-bold ${themeConfig.textColor}`}>Welcome Back</h1>
                <p className={`mt-2 ${themeConfig.subtextColor}`}>Sign in to continue.</p>

                <form onSubmit={handleLogin} className="w-full mt-8 space-y-4">
                    <input 
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputBaseStyle}
                        autoComplete="username"
                    />
                    
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputBaseStyle}
                        autoComplete="current-password"
                    />

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl font-semibold text-white bg-accent hover:shadow-lg hover:shadow-accent/30 transition-shadow disabled:opacity-50`}
                    >
                        {isLoading ? 'Signing In...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;
