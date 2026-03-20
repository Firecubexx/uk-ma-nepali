const handleRegister = async () => {
  try {
    const res = await api.post('/auth/register', {
      name: fullName,        // ✅ FIXED
      email,
      password,
      location: city,        // ✅ FIXED
      gender,
      age
    });

    console.log(res.data);

    // OPTIONAL: auto login after register
    localStorage.setItem('umn_token', res.data.token);
    localStorage.setItem('umn_user', JSON.stringify(res.data.user));

    window.location.href = '/'; // redirect after success

  } catch (err) {
    console.log(err.response?.data || err.message);
    alert(err.response?.data?.message || "Registration failed");
  }
};