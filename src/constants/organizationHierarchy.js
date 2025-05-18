// src/constants/organizationHierarchy.js
export const HIERARCHY_LEVELS = {
    ORGANIZATION: { level: 1, color: 'primary', cardColor: '#83dfce', isLocation: 'yes', colWidth: 12 },
    ARMORY: { level: 2, color: 'secondary', cardColor: '#659dca', isLocation: 'yes', colWidth: 12 },
    BUILDING: { level: 3, color: 'success', cardColor: '#c4e3c5', isLocation: 'yes', colWidth: 12 },
    FLOOR: { level: 4, color: 'info', cardColor: '#b3dfb5', isLocation: 'no', colWidth: 12},
    ZONE: { level: 5, color: 'warning', cardColor: '#FFB74D', isLocation: 'no', colWidth: 12 },
    ROOM: { level: 6, color: 'error', cardColor: '#EF5350', isLocation: 'no', colWidth: 12 },
    PARTITION: { level: 7, color: 'purple', cardColor: '#AB47BC', isLocation: 'no', colWidth:12 },
    SHELF: { level: 8, color: 'orange', cardColor: '#FF7043', isLocation: 'no', colWidth: 12 },
    SLOT: { level: 9, color: 'grey', cardColor: '#dad8d8', isLocation: 'no', colWidth: 12 }
};

// Define colors for reader roles
export const READER_ROLE_COLORS = {
    GATE_MONITOR: "green",
    ROOM_MONITOR: "red",
    PATH_MONITOR: "blue"
};

export const LEVEL_TYPES = Object.keys(HIERARCHY_LEVELS);
export const getLevelNumber = (type) => HIERARCHY_LEVELS[type]?.level;
export const getLevelColor = (type) => HIERARCHY_LEVELS[type]?.color || 'grey';
export const getLevelColorCards = (type) => HIERARCHY_LEVELS[type]?.cardColor || '#9E9E9E'; // Fixed to use cardColor
export const showLocation = (type) => HIERARCHY_LEVELS[type]?.isLocation || 'yes';
export const colWidth = (type) => HIERARCHY_LEVELS[type]?.colWidth || 12;

// Get the color based on the reader role
export const getReaderRoleColor = (role) => READER_ROLE_COLORS[role] || 'grey';
