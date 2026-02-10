import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface LoginProps {
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
    const { login } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [email, setEmail] = useState('alice@company.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(t('invalidCredentials'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded text-sm font-medium ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('pt')}
                    className={`px-3 py-1 rounded text-sm font-medium ${language === 'pt' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border'}`}
                >
                    PT
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8 bg-slate-900 text-white text-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl mx-auto mb-4">HM</div>
                    <h1 className="text-2xl font-bold">{t('welcomeBack')}</h1>
                    <p className="text-slate-400 mt-2 text-sm">{t('signInSubtitle')}</p>
                </div>
                
                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('workEmail')}</label>
                            <input 
                                type="email" 
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('password')}</label>
                            <input 
                                type="password" 
                                required
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70"
                        >
                            {isLoading ? t('signingIn') : t('signIn')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {t('dontHaveAccount')} 
                        <button onClick={onSwitchToRegister} className="text-indigo-600 font-bold ml-1 hover:underline">{t('registerNow')}</button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs text-center text-slate-400">
                            {t('demoCredentials')}:<br/>
                            Customer: alice@company.com<br/>
                            Agent: bob@helpmind.com<br/>
                            Admin: admin@helpmind.com<br/>
                            (Password: password)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};