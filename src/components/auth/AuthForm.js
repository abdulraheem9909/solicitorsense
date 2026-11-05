"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Google } from "@mui/icons-material";
import Image from "next/image";
import { useAuth } from "./useAuth";
import Toaster from "../common/toast";
import GoogleLoginButton from "../common/GoogleLoginButton";

export default function AuthForm() {
  const {
    handleLogin,
    handleSignup,
    loading,
    errors,
    tabValue,
    showPassword,
    setShowPassword,
    loginForm,
    setLoginForm,
    signupForm,
    setSignupForm,
    handleTabChange,
    toast,
    setToast,
  } = useAuth();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          mb: 4,
        }}
      >
        <Image src={"/logo.png"} alt="logo" width={30} height={30} />
        <Typography
          variant="h4"
          color="#1e3c72"
          fontWeight={"bold"}
          fontSize={"1.5rem"}
          marginTop={"4px"}
          ml={1}
        >
          SolicitorSense
        </Typography>
      </Box>

      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 560,
          minHeight: 660,
          p: 4,
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, mb: 1, color: "#1e3c72" }}
          >
            {tabValue === 0 ? "Welcome Back" : "Create Account"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {tabValue === 0
              ? "Access your AI solicitor anytime"
              : "Sign up to start your legal journey"}
          </Typography>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 3,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&.Mui-selected": {
                bgcolor: "#1e3c72",
                color: "white",
              },
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="Login" sx={{ color: "#1e3c72" }} />
          <Tab label="Sign Up" sx={{ color: "#1e3c72" }} />
        </Tabs>

        {tabValue === 0 && (
          <Box component="form" noValidate onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              error={!!errors.email}
              helperText={errors.email}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              error={!!errors.password}
              helperText={errors.password}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            {errors.server && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errors.server}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ py: 1.3, fontWeight: 600, background: "#1e3c72" }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>
        )}

        {tabValue === 1 && (
          <Box component="form" noValidate onSubmit={handleSignup}>
            <TextField
              fullWidth
              label="Full Name"
              value={signupForm.name}
              onChange={(e) =>
                setSignupForm({ ...signupForm, name: e.target.value })
              }
              error={!!errors.name}
              helperText={errors.name}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={signupForm.email}
              onChange={(e) =>
                setSignupForm({ ...signupForm, email: e.target.value })
              }
              error={!!errors.email}
              helperText={errors.email}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={signupForm.password}
              onChange={(e) =>
                setSignupForm({ ...signupForm, password: e.target.value })
              }
              error={!!errors.password}
              helperText={errors.password}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={signupForm.confirmPassword}
              onChange={(e) =>
                setSignupForm({
                  ...signupForm,
                  confirmPassword: e.target.value,
                })
              }
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            {errors.server && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errors.server}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ py: 1.3, fontWeight: 600, background: "#1e3c72" }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </Button>
          </Box>
        )}

        <Box sx={{ position: "relative", my: 3 }}>
          <Divider />
          <Typography
            variant="body2"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              px: 1.5,
              backgroundColor: "background.paper",
              color: "text.secondary",
            }}
          >
            or
          </Typography>
        </Box>

        {/* <GoogleLoginButton /> */}

        <Typography
          variant="body2"
          sx={{
            mt: 3,
            textAlign: "center",
            color: "text.secondary",
            "& a": {
              color: "primary.main",
              textDecoration: "none",
              fontWeight: 500,
            },
          }}
        >
          By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>.
        </Typography>
      </Paper>

      <Toaster toast={toast} setToast={setToast} />
    </Box>
  );
}
