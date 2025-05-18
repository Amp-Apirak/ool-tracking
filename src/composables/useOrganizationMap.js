import { ref, onUnmounted } from 'vue';
import { fetchOrganizationMap, cleanupImageUrl } from '@/utils/organizationMap';

export function useOrganizationMap() {
    const imageUrl = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    const fetchImage = async (organizationId) => {
        if (!organizationId) return;

        isLoading.value = true;
        error.value = null;

        try {
            const url = await fetchOrganizationMap(organizationId, imageUrl);
            return url;
        } catch (err) {
            error.value = err;
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    onUnmounted(() => {
        cleanupImageUrl(imageUrl.value);
    });

    return {
        imageUrl,
        isLoading,
        error,
        fetchImage
    };
}

