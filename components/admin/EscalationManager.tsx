import React, { useState, useMemo } from 'react';
import { EscalationGroup, EscalationRule, EscalationGroupType, Priority, Category, EscalationGroupMemberRole, User } from '../../types';
import { getEscalationGroups, getEscalationRules, getEscalationGroupMembers, getAllUsers, addEscalationGroup, addEscalationRule, addEscalationGroupMember, removeEscalationGroupMember, runEscalationJob, deleteEscalationRule } from '../../services/mockStore';

export const EscalationManager: React.FC = () => {
    const [view, setView] = useState<'GROUPS' | 'RULES'>('GROUPS');
    const [groups, setGroups] = useState<EscalationGroup[]>(getEscalationGroups());
    const [rules, setRules] = useState<EscalationRule[]>(getEscalationRules());
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [showCreateRule, setShowCreateRule] = useState(false);
    const [jobResult, setJobResult] = useState('');

    // Group List Filters
    const [groupFilter, setGroupFilter] = useState<{
        category: string,
        level: string,
        activeTab: 'ALL' | 'ACTIVE' | 'TECHNICAL' | 'MANAGERIAL' | 'REGIONAL'
    }>({ category: '', level: '', activeTab: 'ALL' });

    const refreshData = () => {
        setGroups(getEscalationGroups());
        setRules(getEscalationRules());
    };

    const handleRunJob = () => {
        const count = runEscalationJob('admin');
        setJobResult(`Escalated ${count} tickets.`);
        setTimeout(() => setJobResult(''), 3000);
        refreshData();
    };

    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            if (groupFilter.activeTab === 'ACTIVE' && !g.isActive) return false;
            if (groupFilter.activeTab === 'TECHNICAL' && g.type !== EscalationGroupType.TECHNICAL) return false;
            if (groupFilter.activeTab === 'MANAGERIAL' && g.type !== EscalationGroupType.HIERARCHICAL) return false;
            if (groupFilter.activeTab === 'REGIONAL' && g.type !== EscalationGroupType.REGIONAL) return false;
            
            if (groupFilter.category && g.category !== groupFilter.category) return false;
            if (groupFilter.level && g.level.toString() !== groupFilter.level) return false;
            return true;
        });
    }, [groups, groupFilter]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Main Header with Quick Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Escalation Group Management</h3>
                    <p className="text-slate-500 text-sm mt-1">Configure automated routing, SLAs, and support tiers.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setShowCreateGroup(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        New Group
                    </button>
                    <button 
                        className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import
                    </button>
                    <button 
                        className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export
                    </button>
                </div>
            </div>

            {/* Navigation & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                {/* Custom Tab Navigation */}
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    {[
                        { id: 'GROUPS', label: 'Escalation Groups' },
                        { id: 'RULES', label: 'Escalation Rules' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setView(tab.id as any); setSelectedGroup(null); }}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                view === tab.id 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Job Runner Status */}
                <div className="flex items-center space-x-3">
                    {jobResult && <span className="text-green-600 font-bold text-sm animate-fade-in">{jobResult}</span>}
                    <button 
                        onClick={handleRunJob}
                        className="text-slate-500 hover:text-indigo-600 text-xs font-bold uppercase tracking-wide flex items-center transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Run Manual Escalation
                    </button>
                </div>
            </div>

            {view === 'GROUPS' && (
                selectedGroup ? (
                    <GroupDetailView groupId={selectedGroup} onBack={() => setSelectedGroup(null)} />
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Sub-Tabs for Group Filtering */}
                        <div className="px-6 pt-4 border-b border-slate-200 flex space-x-6 overflow-x-auto">
                            {[
                                { id: 'ALL', label: `All Groups (${groups.length})` },
                                { id: 'ACTIVE', label: `Active (${groups.filter(g => g.isActive).length})` },
                                { id: 'TECHNICAL', label: 'Technical Teams' },
                                { id: 'MANAGERIAL', label: 'Managerial' },
                                { id: 'REGIONAL', label: 'Regional' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setGroupFilter({ ...groupFilter, activeTab: tab.id as any })}
                                    className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        groupFilter.activeTab === tab.id 
                                        ? 'border-indigo-600 text-indigo-600' 
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Table Filters */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4">
                            <input 
                                type="text" 
                                placeholder="Search groups..." 
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <select 
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={groupFilter.category}
                                onChange={(e) => setGroupFilter({...groupFilter, category: e.target.value})}
                            >
                                <option value="">All Categories</option>
                                <option value="Network">Network</option>
                                <option value="Security">Security</option>
                                <option value="Hardware">Hardware</option>
                            </select>
                            <select 
                                className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={groupFilter.level}
                                onChange={(e) => setGroupFilter({...groupFilter, level: e.target.value})}
                            >
                                <option value="">All Levels</option>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                            </select>
                        </div>

                        {/* Groups Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Group Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Level</th>
                                        <th className="px-6 py-4">Members</th>
                                        <th className="px-6 py-4">SLA Response</th>
                                        <th className="px-6 py-4">Workload</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredGroups.map(group => {
                                        const members = getEscalationGroupMembers(group.id);
                                        return (
                                            <tr key={group.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-bold text-slate-800">{group.name}</div>
                                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{group.code}</div>
                                                        {group.description && <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{group.description}</div>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        group.type === EscalationGroupType.TECHNICAL ? 'bg-blue-100 text-blue-800' : 
                                                        group.type === EscalationGroupType.HIERARCHICAL ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {group.type === EscalationGroupType.TECHNICAL ? group.category : group.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                                                            L{group.level}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {members.slice(0, 3).map(m => (
                                                            <div key={m.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600" title={m.role}>
                                                                {m.role[0]}
                                                            </div>
                                                        ))}
                                                        {members.length > 3 && (
                                                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">+{members.length - 3}</div>
                                                        )}
                                                        {members.length === 0 && <span className="text-slate-400 italic text-xs">Empty</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {group.responseSlaMinutes}m
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-full ${group.activeTickets && group.activeTickets > (group.maxConcurrentTickets || 10) * 0.8 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                                style={{ width: `${Math.min(100, ((group.activeTickets || 0) / (group.maxConcurrentTickets || 1)) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-slate-500">{group.activeTickets || 0}/{group.maxConcurrentTickets || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${group.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {group.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => setSelectedGroup(group.id)}
                                                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" 
                                                            title="Manage Members"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                        </button>
                                                        <button className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit Group">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredGroups.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic">
                                                No escalation groups match your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {view === 'RULES' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2">
                            {['Time-Based', 'Status-Based', 'Priority-Based', 'Manual'].map(type => (
                                <button key={type} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                                    {type}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowCreateRule(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                            + Create Rule
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {rules.map(rule => (
                            <div key={rule.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between group">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <h4 className="font-bold text-slate-800 text-lg">{rule.name}</h4>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {rule.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                            {rule.triggerType?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4">{rule.description || 'No description provided.'}</p>
                                    
                                    <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-lg border border-slate-100 inline-block w-full max-w-3xl">
                                        <div className="flex items-center space-x-2 min-w-[200px]">
                                            <span className="text-xs font-bold text-slate-400 uppercase">IF</span>
                                            <div className="flex space-x-2">
                                                {rule.condition.priority && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{rule.condition.priority}</span>}
                                                {rule.condition.category && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{rule.condition.category}</span>}
                                                {rule.condition.slaStatus && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">{rule.condition.slaStatus}</span>}
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-bold text-slate-400 uppercase">THEN</span>
                                            {rule.action.targetGroupId ? (
                                                <div className="flex items-center text-sm font-medium text-slate-700">
                                                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold mr-2">Route To</span>
                                                    {groups.find(g => g.id === rule.action.targetGroupId)?.name || 'Unknown Group'}
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-sm font-medium text-slate-700">
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold mr-2">Assign To</span>
                                                    Specific Agent
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="text-slate-400 hover:text-indigo-600 p-2 rounded hover:bg-slate-50 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => { deleteEscalationRule(rule.id); refreshData(); }} className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateGroup && (
                <CreateGroupModal onClose={() => setShowCreateGroup(false)} onRefresh={refreshData} />
            )}

            {/* Create Rule Modal */}
            {showCreateRule && (
                <CreateRuleModal groups={groups} onClose={() => setShowCreateRule(false)} onRefresh={refreshData} />
            )}
        </div>
    );
};

// --- Sub-Components ---

const GroupDetailView: React.FC<{ groupId: string; onBack: () => void }> = ({ groupId, onBack }) => {
    const groups = getEscalationGroups();
    const group = groups.find(g => g.id === groupId);
    const members = getEscalationGroupMembers(groupId);
    const allUsers = getAllUsers().filter(u => u.role === 'AGENT' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'); 
    const [showAddMember, setShowAddMember] = useState(false);

    if (!group) return <div>Group not found</div>;

    const handleAddMember = (userId: string, role: EscalationGroupMemberRole) => {
        addEscalationGroupMember({ groupId, userId, role, weeklyCapacityHours: 40 });
        setShowAddMember(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center group">
                    <div className="p-1 rounded-full bg-slate-100 group-hover:bg-slate-200 mr-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </div>
                    Back to Groups
                </button>
                <div className="flex space-x-2">
                    <button className="btn-secondary px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Edit Group</button>
                    <button className="btn-primary px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded text-sm hover:bg-red-100">Deactivate</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Members */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            Team Roster ({members.length})
                        </h4>
                        <button onClick={() => setShowAddMember(true)} className="text-sm text-indigo-600 font-bold hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            + Add Member
                        </button>
                    </div>

                    {showAddMember && (
                        <div className="bg-slate-50 p-4 border-b border-slate-200">
                            <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Add New Member</h5>
                            <div className="flex gap-2">
                                <select id="newMemberUser" className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    {allUsers.filter(u => !members.find(m => m.userId === u.id)).map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                </select>
                                <select id="newMemberRole" className="w-40 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                                    <option value={EscalationGroupMemberRole.MEMBER}>Member</option>
                                    <option value={EscalationGroupMemberRole.LEAD}>Lead</option>
                                    <option value={EscalationGroupMemberRole.BACKUP}>Backup</option>
                                    <option value={EscalationGroupMemberRole.ESCALATION_POINT}>Escalation Point</option>
                                </select>
                                <button 
                                    onClick={() => {
                                        const userId = (document.getElementById('newMemberUser') as HTMLSelectElement).value;
                                        const role = (document.getElementById('newMemberRole') as HTMLSelectElement).value as EscalationGroupMemberRole;
                                        handleAddMember(userId, role);
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                                >
                                    Add
                                </button>
                                <button onClick={() => setShowAddMember(false)} className="text-slate-500 px-3 hover:text-slate-700">Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="divide-y divide-slate-100">
                        {members.map(member => {
                            const user = allUsers.find(u => u.id === member.userId);
                            return (
                                <div key={member.id} className="p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                                    <div className="flex items-center">
                                        <img src={user?.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200 mr-3" />
                                        <div>
                                            <div className="font-medium text-slate-900">{user?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{user?.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                                            member.role === 'LEAD' ? 'bg-purple-100 text-purple-700' :
                                            member.role === 'BACKUP' ? 'bg-orange-100 text-orange-700' : 
                                            member.role === 'ESCALATION_POINT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {member.role.replace('_', ' ')}
                                        </span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-slate-700">{member.weeklyCapacityHours}h</div>
                                            <div className="text-[10px] text-slate-400 uppercase">Capacity</div>
                                        </div>
                                        <button 
                                            onClick={() => removeEscalationGroupMember(member.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-red-50"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {members.length === 0 && (
                            <div className="p-8 text-center text-slate-400 italic bg-slate-50/50">
                                No members assigned to this group yet. Add members to start routing tickets.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Config & Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{group.name}</h2>
                                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">{group.code}</span>
                            </div>
                            <span className={`w-3 h-3 rounded-full ${group.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></span>
                        </div>
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{group.description || 'No description available.'}</p>
                        
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Classification</span>
                                <span className="font-medium text-slate-800">{group.type} / {group.category}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Tier Level</span>
                                <span className="font-medium text-slate-800">L{group.level}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Schedule</span>
                                <span className="font-medium text-slate-800">{group.availabilitySchedule || 'Standard'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Routing</span>
                                <span className="font-medium text-slate-800">{group.autoAssign ? 'Auto-Assign' : 'Manual Triage'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Service Level Targets</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-700">{group.responseSlaMinutes}m</div>
                                <div className="text-[10px] text-blue-600 font-medium uppercase mt-1">Response SLA</div>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg text-center">
                                <div className="text-2xl font-bold text-indigo-700">{group.resolutionSlaMinutes || '-'}m</div>
                                <div className="text-[10px] text-indigo-600 font-medium uppercase mt-1">Resolution SLA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreateGroupModal: React.FC<{ onClose: () => void; onRefresh: () => void }> = ({ onClose, onRefresh }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState<EscalationGroupType>(EscalationGroupType.TECHNICAL);
    const [level, setLevel] = useState(1);
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addEscalationGroup({
            name, code, type, level, description,
            category: 'General', responseSlaMinutes: 60, autoAssign: true, isActive: true
        });
        onRefresh();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Create Escalation Group</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                            <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. L3 Database Ops" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Group Code</label>
                            <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg font-mono uppercase text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={code} onChange={e => setCode(e.target.value)} placeholder="ESC-DB-03" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                            <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={level} onChange={e => setLevel(Number(e.target.value))}>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                                <option value="4">Level 4</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={type} onChange={e => setType(e.target.value as any)}>
                            {Object.values(EscalationGroupType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this group responsible for?" />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Create Group</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CreateRuleModal: React.FC<{ groups: EscalationGroup[], onClose: () => void; onRefresh: () => void }> = ({ groups, onClose, onRefresh }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority | ''>('');
    const [category, setCategory] = useState<Category | ''>('');
    const [targetGroupId, setTargetGroupId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addEscalationRule({
            name, description,
            triggerType: 'PRIORITY_BASED', // Default for now
            isActive: true,
            condition: {
                priority: priority || undefined,
                category: category || undefined,
                slaStatus: 'BREACHED'
            },
            action: {
                targetGroupId: targetGroupId || undefined,
                note: `Auto-routed to ${targetGroupId ? 'Group' : 'Agent'}`
            }
        });
        onRefresh();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">New Routing Rule</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
                            <input required type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Critical Finance Breach" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Briefly describe logic..." />
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4 relative">
                        <div className="absolute -top-3 left-3 bg-slate-50 px-2 text-xs font-bold text-slate-500 uppercase">Conditions (IF)</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 font-bold uppercase mb-1">Priority</label>
                                <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none" value={priority} onChange={e => setPriority(e.target.value as any)}>
                                    <option value="">Any Priority</option>
                                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 font-bold uppercase mb-1">Category</label>
                                <select className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white outline-none" value={category} onChange={e => setCategory(e.target.value as any)}>
                                    <option value="">Any Category</option>
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-4 relative">
                        <div className="absolute -top-3 left-3 bg-indigo-50 px-2 text-xs font-bold text-indigo-600 uppercase">Action (THEN)</div>
                        <div>
                            <label className="block text-xs text-indigo-800 font-bold uppercase mb-1">Route to Group</label>
                            <select required className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white outline-none" value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)}>
                                <option value="">Select Target Group...</option>
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.type})</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Save Rule</button>
                    </div>
                </form>
            </div>
        </div>
    );
};