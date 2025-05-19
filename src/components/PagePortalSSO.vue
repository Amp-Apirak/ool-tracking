<!-- PagePortalSSO.vue -->

<template>
  <div style="padding: 1rem">
    <h2>Logging in via Web Portal...</h2>
    <p>Waiting for token validation...</p>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token";
import { useUserMenusStore } from "@/stores/useUserMenusStore";

const router = useRouter();
const tokenStore = useTokenStore();

onMounted(async () => {
  console.info("[PagePortalSSO] Clearing old tokens...");
  tokenStore.clearTokenData();

  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get("authToken");
  console.info("[PagePortalSSO] Extracted authToken:", authToken);

  const userMenusStore = useUserMenusStore();

  if (!authToken) {
    return router.replace("/");
  }

  console.info("[PagePortalSSO] Sending POST /auth/portal-login...");

  try {
    // const res = await fetch(
    //   `${import.meta.env.VITE_API_ENDPOINT}/auth/portal-login`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ authToken }),
    //   }
    // );

    // console.info("[PagePortalSSO] Response status:", res.status);

    // if (!res.ok) {
    //   console.warn(`Login failed with status ${res.status}`);
    //   return router.replace("/");
    // }

    //const data = await res.json();
    const data = {
      token:
        "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlcl9hZG1pbiIsImlhdCI6MTc0NzY2NjIyNCwiZXhwIjoxNzQ3NjY5ODI0LCJyb2xlcyI6WyJhZG1pbiJdLCJpc0FkbWluIjp0cnVlfQ.ezmrVAdmqIOGdi1DjxIR9rwGxXWv-s1FBpyJYO8j0Z9RI7M83eZ_lfAoIBTBLGVqc7DdpHVXnA7HDqrapf4GkA",
      accessToken:
        "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzb2FwX3ZhbGxleSIsImp0aSI6ImE5NDAyOWI1LWZhZjUtNGU0Ny1hMjBjLThjMjgxOWE5OTY0NSIsImlhdCI6MTc0NzE5NDQyMiwicm9sZXMiOiIiLCJleHAiOjE3NDcxOTgwMjIsImlzcyI6IlVNUyIsImF1ZCI6IjI4MWp6NzVjYTB5NWRybDMxZzl1eWNvMmZ2d2lxdTA1In0.TCILLZV8iUgzmA3ZX4fZzHdYIUhiPpdNgHqMI5m5ZRo",
      userProfile: {
        id: 4730,
        prefix: "พ.ต.ท.",
        firstName: " soap(ทดสอบ)",
        lastName: "valley",
        username: "soap_valley",
        isActing: false,
        email: "-",
        telephone: "-",
        lineId: null,
        isConnectedGoogle: false,
        isConnectedFacebook: false,
        googleAccountId: null,
        facebookAccountId: null,
        isChangedInitPassword: true,
        isAdmin: false,
        isExternal: false,
        department: {
          id: 52,
          titleTh: "งานจัดหา",
          titleEn: null,
          abbreviation: null,
        },
        division: {
          id: 16,
          titleTh: "กองสรรพาวุธ",
          titleEn: null,
          abbreviation: "สพ.",
        },
        gender: {
          id: 1,
          title: "ชาย",
        },
        organization: {
          id: 4,
          titleTh: "สำนักงานส่งกำลังบำรุง",
          titleEn: null,
          abbreviation: "สกบ.",
        },
        position: {
          id: 10,
          title: "สารวัตรและพนักงานสอบสวนผู้ชำนาญการ",
          abbreviation: "สว.",
        },
        rank: {
          id: 5,
          title: "พันตำรวจโท",
        },
        subdivision: {
          id: 64,
          titleTh: "ฝ่ายสรรพาวุธ 1",
          titleEn: null,
          abbreviation: "ฝ่ายสรรพาวุธ 1",
        },
        applicationAccesses: [
          {
            id: 2976,
            applicationId: 10,
            userId: 4730,
          },
          {
            id: 2977,
            applicationId: 8,
            userId: 4730,
          },
          {
            id: 2978,
            applicationId: 32,
            userId: 4730,
          },
          {
            id: 2979,
            applicationId: 1,
            userId: 4730,
          },
          {
            id: 2980,
            applicationId: 3,
            userId: 4730,
          },
          {
            id: 2981,
            applicationId: 4,
            userId: 4730,
          },
          {
            id: 2982,
            applicationId: 5,
            userId: 4730,
          },
          {
            id: 2983,
            applicationId: 6,
            userId: 4730,
          },
          {
            id: 2984,
            applicationId: 7,
            userId: 4730,
          },
          {
            id: 2985,
            applicationId: 9,
            userId: 4730,
          },
          {
            id: 2986,
            applicationId: 12,
            userId: 4730,
          },
          {
            id: 2987,
            applicationId: 13,
            userId: 4730,
          },
          {
            id: 2988,
            applicationId: 14,
            userId: 4730,
          },
          {
            id: 2989,
            applicationId: 15,
            userId: 4730,
          },
          {
            id: 2990,
            applicationId: 16,
            userId: 4730,
          },
          {
            id: 2991,
            applicationId: 17,
            userId: 4730,
          },
          {
            id: 2992,
            applicationId: 18,
            userId: 4730,
          },
          {
            id: 2993,
            applicationId: 19,
            userId: 4730,
          },
          {
            id: 2994,
            applicationId: 20,
            userId: 4730,
          },
          {
            id: 2995,
            applicationId: 21,
            userId: 4730,
          },
          {
            id: 2996,
            applicationId: 24,
            userId: 4730,
          },
          {
            id: 2997,
            applicationId: 25,
            userId: 4730,
          },
          {
            id: 2998,
            applicationId: 27,
            userId: 4730,
          },
          {
            id: 2999,
            applicationId: 26,
            userId: 4730,
          },
          {
            id: 3000,
            applicationId: 28,
            userId: 4730,
          },
          {
            id: 3001,
            applicationId: 29,
            userId: 4730,
          },
          {
            id: 3002,
            applicationId: 31,
            userId: 4730,
          },
          {
            id: 3003,
            applicationId: 33,
            userId: 4730,
          },
          {
            id: 3004,
            applicationId: 34,
            userId: 4730,
          },
        ],
        dms: {
          subDept: {
            id: 52,
            ssoDepartmentId: 52,
            subDeptName: "งานจัดหา",
            deptId: 19,
            subDeptStatusId: 1,
            dept: null,
            documentTypes: [],
            documents: [],
            folders: [],
          },
          dept: {
            deptId: 19,
            ssoSubdivisionId: 64,
            orgId: 4,
            deptName: "ฝ่ายสรรพาวุธ 1",
            deptStatusId: 1,
            org: null,
            documentTypes: [],
            documents: [],
            folders: [],
            subDepartments: [],
          },
          org: {
            orgId: 4,
            ssoDivisionId: 16,
            orgName: "กองสรรพาวุธ",
            orgNameSh: "สพ.สกบ.",
            orgStatusId: 1,
            departments: [],
            documentTypes: [],
            documents: [],
            folders: [],
          },
        },
      },
      userId: "910f5fe0-581a-4eab-b49b-e1f7878295e4",
    };

    // Use the token store to save tokens
    tokenStore.setTokens({
      portalToken: data.accessToken,
      apiToken: data.token || data.token,
    });

    console.info("[PagePortalSSO] Tokens saved to sessionStorage.");

    // เก็บ userProfile ลง sessionStorage แบบปลอดภัย
    if (data.userProfile) {
      tokenStore.setUserProfile(data.userProfile);
    }

    const userId = data.userId;

    console.info("[PagePortalSSO] userId:", userId);

    if (userId) {
      await userMenusStore.fetchUserMenuPermissions(userId);
      console.info("[PagePortalSSO] Menu permissions loaded.");
    }

    console.info("[PagePortalSSO] Redirecting to /main/Dashboard...");

    await router.replace("/main/Dashboard");
  } catch (err) {
    console.error("SSO login error:", err);
    await router.replace("/");
  }
});
</script>
