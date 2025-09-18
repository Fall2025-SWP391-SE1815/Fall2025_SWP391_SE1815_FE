// Template

// Public routes
export const publicPaths = {
  home: "/",
  login: "/auth/login",
  register: "/auth/register",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/verify-email",
  verifySuccess: "/verify-success",
  notFound: "*",
};

// User routes
export const userPaths = {
  home: "/user",
  dashboard: "/user/dashboard",
  profile: "/user/profile",
  createPost: "/user/posts/create",
  editPost: "/user/posts/edit/:postId",
  postDetail: "/user/posts/:postId",
  favorites: "/user/favorites",
  chat: "/user/chat",
  createReport: "/user/report/create",
};

// Moderator routes
export const moderatorPaths = {
  home: "/moderator",
  dashboard: "/moderator/dashboard",
  profile: "/moderator/profile",
  approvePost: "/moderator/approve-post",
  postReview: "/moderator/posts/review/:postId",
  tagManagement: "/moderator/tag-management",
  materialManagement: "/moderator/material-management",
  topicManagement: "/moderator/topic-management",
  unitManagement: "/moderator/unit-management",
  groupChatManagement: "/moderator/group-chat-management",
};

// Admin routes
export const adminPaths = {
  home: "/admin",
  dashboard: "/admin/dashboard",
  profile: "/admin/profile",
  userManagement: "/admin/user-management",
  approvePost: "/admin/approve-post",
  postReview: "/admin/posts/review/:postId",
  tagManagement: "/admin/tag-management",
  materialManagement: "/admin/material-management",
  topicManagement: "/admin/topic-management",
  unitManagement: "/admin/unit-management",
  groupChatManagement: "/admin/group-chat-management",
  chat: "/admin/chat",
};

// Default route by role
export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case "admin":
      return adminPaths.home;
    case "moderator":
      return moderatorPaths.home;
    case "user":
      return userPaths.home;
    default:
      return publicPaths.login;
  }
};
