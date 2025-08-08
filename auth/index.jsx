import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Auth = ({ onAuthSuccess }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Sign Up
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (tab === 1) {
      // Sign up: store credentials locally
      localStorage.setItem("demoUser", JSON.stringify(formData));
      alert("Account created! Please log in.");
      setTab(0);
    } else {
      // Login: verify credentials
      const savedUser = JSON.parse(localStorage.getItem("demoUser"));
      if (
        savedUser &&
        savedUser.email === formData.email &&
        savedUser.password === formData.password
      ) {
        localStorage.setItem("isAuthenticated", "true");
        onAuthSuccess();
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    }
  };

  return (
    <Box height="100vh" display="flex">
      {/* Left branding panel */}
      <Box
        flex={1}
        display={{ xs: "none", md: "flex" }}
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.background.alt,
          p: 4,
        }}
      >
        {/* Replace with your actual logo */}
        <Typography variant="h3" fontWeight="bold" mb={2}>
          MyCompany
        </Typography>
        <Typography
          variant="h5"
          sx={{ opacity: 0.9, maxWidth: "300px", textAlign: "center" }}
        >
          Manage your business with insight and control
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        flex={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor={theme.palette.background.default}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: 400,
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.55rem",
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            textAlign="center"
            fontWeight="bold"
            color={theme.palette.secondary[100]}
            mb={2}
          >
            Welcome
          </Typography>
          <Typography
            variant="body2"
            textAlign="center"
            color={theme.palette.secondary[300]}
            mb={3}
          >
            {tab === 0
              ? "Log in to access your dashboard"
              : "Create your account"}
          </Typography>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            centered
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                color: theme.palette.secondary[300],
                fontWeight: "bold",
              },
              "& .Mui-selected": {
                color: theme.palette.secondary.main,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: theme.palette.secondary.main,
              },
            }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              InputLabelProps={{
                style: { color: theme.palette.secondary[300] },
              }}
              InputProps={{
                style: {
                  color: theme.palette.secondary[100],
                  backgroundColor: theme.palette.background.default,
                  borderRadius: "0.55rem",
                },
              }}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              InputLabelProps={{
                style: { color: theme.palette.secondary[300] },
              }}
              InputProps={{
                style: {
                  color: theme.palette.secondary[100],
                  backgroundColor: theme.palette.background.default,
                  borderRadius: "0.55rem",
                },
              }}
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.background.alt,
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: theme.palette.secondary[700],
                },
              }}
            >
              {tab === 0 ? "Login" : "Sign Up"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Auth;
