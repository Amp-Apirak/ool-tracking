// utils/organizationMap.js

import api from "@/axiostoastapi.js";

export const cleanupImageUrl = (url) => {
    if (url) {
        URL.revokeObjectURL(url);
    }
};

export const fetchOrganizationMap = async (organizationId, targetRef) => {
    if (!organizationId) {
        console.warn('No organization UUID provided for fetching map.');
        targetRef.value = null;
        return null;
    }

    console.log('Fetching image for organization UUID:', organizationId);

    try {
        const response = await api.get(
            `/api/organization-maps/org/${organizationId}`,
            { responseType: 'blob' }
        );

        if (response.status === 200) {
            const imageUrl = URL.createObjectURL(response.data);
            targetRef.value = imageUrl;
            console.log('Map image fetched successfully.');
            return imageUrl;
        }

        console.warn('Unexpected response status:', response.status);
        targetRef.value = null;
        return null;

    } catch (error) {
        if (error.response?.status === 404) {
            console.warn('Map not found for organization UUID:', organizationId);
        } else {
            console.error('Error fetching map:', error);
        }
        targetRef.value = null;
        return null;
    }
};

// How to use

// import { useOrganizationMap } from '@/composables/useOrganizationMap';
//
// const {
//   imageUrl: mapImageUrl,
//   isLoading: isMapLoading,
//   fetchImage: fetchMap
// } = useOrganizationMap();
//
// const {
//   imageUrl: floorPlanImageUrl,
//   isLoading: isFloorPlanLoading,
//   fetchImage: fetchFloorPlan
// } = useOrganizationMap();
//
// onMounted(async () => {
//   await Promise.all([
//     fetchMap(props.rootOrganizationId),
//     fetchFloorPlan(props.lowestOrganizationId)
//   ]);
// });

