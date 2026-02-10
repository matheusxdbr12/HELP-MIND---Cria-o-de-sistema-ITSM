import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDepartments } from '../../services/mockStore';
import { useLanguage } from '../../context/LanguageContext';

interface RegisterProps {
    onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
    const { register } = useAuth();
    const { t } = useLanguage();
    const departments = getDepartments();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [isAgent, setIsAgent] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!departmentId) {
            setError("Please select a department");
            return;
        }

        setIsLoading(true);
        try {
            await register(email, password, name, departmentId, isAgent ? 'AGENT' : 'CUSTOMER');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8 bg-slate-900 text-white text-center">
                    <h1 className="text-2xl font-bold">{t('createAccount')}</h1>
                    <p className="text-slate-400 mt-2 text-sm">{t('joinPortal')}</p>
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('fullName')}</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('workEmail')}</label>
                            <input 
                                type="email" 
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{t('department')}</label>
                            <select
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                            >
                                <option value="">{t('selectDepartment')}</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center pt-2">
                            <input 
                                type="checkbox" 
                                id="isAgent" 
                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                checked={isAgent}
                                onChange={(e) => setIsAgent(e.target.checked)}
                            />
                            <label htmlFor="isAgent" className="ml-2 text-sm text-slate-600">{t('registerAsAgent')}</label>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 mt-4"
                        >
                            {isLoading ? t('creatingAccount') : t('register')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {t('alreadyHaveAccount')} 
                        <button onClick={onSwitchToLogin} className="text-indigo-600 font-bold ml-1 hover:underline">{t('signIn')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};