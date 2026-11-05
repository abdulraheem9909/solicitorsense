// src/components/Sidebar.js
"use client";

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Skeleton,
} from "@mui/material";
import Image from "next/image";
import { Add, KeyboardArrowDown, Logout } from "@mui/icons-material";
import useHasMounted from "@/hooks/useHasMounted";
import useSidebar from "./useSidebar";
import { getInitials } from "@/lib/helper";

export default function Sidebar({
  sessionId,
  fetchDataForSession,
  initiateNewChat,
  mobileOpen,
  setMobileOpen,
  children,
}) {
  const hasMounted = useHasMounted();
  const {
    isOpen,
    toggleSidebar,
    isMobile,
    loading,
    data = [],
    anchorEl,
    openAvatar,
    handleClickAvatar,
    handleCloseAvatar,
    handleLogout,
    user,
  } = useSidebar({
    sessionId,
  });

  if (!hasMounted) return null;

  const drawerWidth = isOpen || isMobile ? 280 : 66;

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen || isMobile ? "space-between" : "center",
          height: 64,
          px: 2,
          paddingBottom: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Image src={"/logo.png"} alt="logo" width={30} height={30} />
          <Typography
            variant="h6"
            color="#1e3c72"
            fontWeight={"bold"}
            fontSize={"1rem"}
            marginTop={"4px"}
          >
            {isOpen ? "SolicitorSense" : ""}
          </Typography>
        </Box>

        {!isMobile && isOpen && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              padding: "4px",
              marginBottom: "4px",
              "& .MuiTouchRipple-root": {
                borderRadius: "8px",
              },
              "&:hover": {
                backgroundColor: "#dce3f0",
                borderRadius: "8px",
              },
            }}
          >
            <Image
              src={"/sidebar_left.png"}
              alt="logo"
              width={25}
              height={25}
            />
          </IconButton>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen || isMobile ? "space-between" : "center",
          px: 2,
        }}
      >
        {!isMobile && !isOpen && (
          <Tooltip title="Open sidebar" placement="right">
            <IconButton
              onClick={toggleSidebar}
              sx={{
                padding: "4px",
                marginBottom: "4px",
                "& .MuiTouchRipple-root": {
                  borderRadius: "8px",
                },
                "&:hover": {
                  backgroundColor: "#dce3f0",
                  borderRadius: "8px",
                },
              }}
            >
              <Image
                src={"/sidebar_right.png"}
                alt="logo"
                width={25}
                height={25}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <>
        {isOpen || isMobile ? (
          <Box sx={{ px: 2, py: 2, mt: 4 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={initiateNewChat}
              sx={{
                background: "#1e3c72",
              }}
            >
              New Chat
            </Button>
          </Box>
        ) : (
          <Box sx={{ px: 2, py: 0 }}>
            <Tooltip title="New Chat" placement="right">
              <IconButton
                onClick={initiateNewChat}
                sx={{ mx: "auto", display: "block", padding: "0px" }}
              >
                <Add
                  sx={{
                    background: "#1e3c72",
                    padding: "4px",
                    borderRadius: "4px",
                    color: "#f5f4ed",
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </>

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: isOpen ? 1 : 0 }}>
        {data.length > 0 && (isOpen || isMobile) && (
          <Typography
            variant="subtitle2"
            sx={{ px: 2, mb: 1, color: "text.secondary" }}
          >
            Recent
          </Typography>
        )}
        <List>
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={35}
                  sx={{ mb: 1 }}
                />
              ))}
            </>
          ) : (
            data.map((chat) => {
              const isActive = sessionId === chat.sessionId;

              const item = (
                <ListItemButton
                  selected={isActive}
                  onClick={() => fetchDataForSession(chat.sessionId)}
                  sx={{
                    justifyContent: isOpen ? "flex-start" : "center",
                    px: isOpen ? 2 : 1,
                    mb: 1,
                    // Normal state styles
                    borderRadius: "8px",
                    transition:
                      "background-color 0.2s ease, transform 0.1s ease",

                    // Hover state
                    "&:hover": {
                      backgroundColor: "#f0f4ff", // Light blue background on hover
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 6px rgba(30, 60, 114, 0.1)",
                    },

                    // Active state (when selected)
                    "&.Mui-selected": {
                      backgroundColor: "#1e3c72", // Dark blue background
                      color: "white",
                      fontWeight: 600,
                    },

                    // Hover state when already selected
                    "&.Mui-selected:hover": {
                      backgroundColor: "#0d2a5c", // Slightly darker blue
                      boxShadow: "0 2px 8px rgba(13, 42, 92, 0.2)",
                    },
                  }}
                >
                  {(isOpen || isMobile) && (
                    <ListItemText
                      primary={chat.msg}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: 14,
                        // Text color adjustment for selected state
                        color: isActive ? "inherit" : "text.primary",
                      }}
                    />
                  )}
                </ListItemButton>
              );

              return (
                <ListItem key={chat.sessionId} disablePadding>
                  {(isOpen || isMobile) && item}
                </ListItem>
              );
            })
          )}
        </List>
      </Box>

      <Divider />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          px: 2,
          py: 2,
          cursor: "pointer",
        }}
        aria-controls={openAvatar ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openAvatar ? "true" : undefined}
        onClick={handleClickAvatar}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              mr: isOpen ? 1 : 0,
              background: "#1e3c72",
              color: "white",
            }}
          >
            <Typography variant="h8" fontSize={14}>
              {getInitials(user?.name)}
            </Typography>
          </Avatar>
          {isOpen && (
            <Tooltip title={user?.name} arrow>
              <Typography
                variant="body1"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "160px",
                  cursor: "pointer",
                }}
              >
                {user?.name?.split(" ")[0]}
              </Typography>
            </Tooltip>
          )}
        </Box>
        {isOpen && <KeyboardArrowDown sx={{ color: "#1e3c72" }} />}
      </Box>
    </Box>
  );

  // Rendered once, outside drawerContent: both drawers render drawerContent,
  // and a menu inside it would open twice since they share anchorEl.
  const profileMenu = (
    <Menu
      id="profile-menu"
      anchorEl={anchorEl}
      open={openAvatar}
      onClose={handleCloseAvatar}
      slotProps={{
        paper: {
          sx: {
            minWidth: 180,
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
            border: "1px solid",
            borderColor: "divider",
            py: 0.5,
            overflow: "hidden",
          },
        },
      }}
    >
      <MenuItem
        onClick={() => {
          console.log("clicked");
          handleLogout();
        }}
        sx={{
          px: 3,
          py: 1.5,
          minWidth: 200,
          width: "100%",
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          gap: 2,
          fontSize: 14,
          color: "text.primary",
          transition: "all 0.2s ease",

          "&:hover": {
            backgroundColor: "#f0f4ff",
            color: "#1e3c72",
          },

          "&:focus": {
            backgroundColor: "#e6edff",
          },

          "&:active": {
            backgroundColor: "#dbeafe",
            transform: "scale(0.98)",
          },

          "& svg": {
            color: "inherit",
            fontSize: 18,
          },
        }}
      >
        <Logout fontSize="small" />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#f5f4ed",
            overflowX: "hidden",
            boxShadow:
              "0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06)",
            transition: "all .4s ease",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            transition: "width 0.3s ease",
            boxSizing: "border-box",
            background: "#f5f4ed",
            overflowX: "hidden",
            boxShadow:
              "0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06)",
            transition: "all .4s ease",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {profileMenu}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, sm: 2, md: 0 },
          pt: { xs: 6, sm: 3, md: 3 },
          pl: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 2, sm: 3, md: 4 },
          ml: { sm: `${drawerWidth}px` }, // Shift content right by sidebar width
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
          transition: "margin-left 0.3s ease, width 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
