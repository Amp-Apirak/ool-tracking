<!-- DirectLogin.vue -->

<template>
  <div class="direct-login">
    <div class="login-container">
      <h2>เข้าสู่ระบบโดยตรง (สำหรับผู้ดูแลระบบ)</h2>

      <div class="form-group">
        <label for="username">ชื่อผู้ใช้:</label>
        <input type="text" id="username" v-model="username" placeholder="ระบุชื่อผู้ใช้">
      </div>

      <div class="form-group">
        <label for="password">รหัสผ่าน:</label>
        <input type="password" id="password" v-model="password" placeholder="ระบุรหัสผ่าน">
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>

      <div class="back-link">
        <a href="#" @click.prevent="goToPortal">กลับไปยัง Portal</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import api from '@/axiostoastapi';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();
const tokenStore = useTokenStore();

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'กรุณาระบุชื่อผู้ใช้และรหัสผ่าน';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    console.log('Direct login',username.value, password.value);
    // เรียก API endpoint สำหรับการเข้าสู่ระบบโดยตรง
    const response = await api.post('/api/direct-login', {
      username: username.value,
      password: password.value
    }, { noAuth: true });

    // บันทึก token
    tokenStore.setTokens({
      apiToken: response.data.token
    });

    // ไปยังหน้า Dashboard
    router.push('/main/Dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    errorMessage.value = error.response?.data?.message || 'เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง';
  } finally {
    isLoading.value = false;
  }
};

const goToPortal = () => {
  const portalUrl = import.meta.env.VITE_PORTAL_LOGIN_URL;
  if (portalUrl) {
    window.location.href = portalUrl;
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.direct-login {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:disabled {
  background-color: #93a6f8;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.back-link {
  text-align: center;
  margin-top: 1rem;
}

.back-link a {
  color: #4a6cf7;
  text-decoration: none;
}
</style>
