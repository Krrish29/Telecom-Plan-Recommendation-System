// =====================================================
// 🔥 MICROSERVICE URLS
// =====================================================
import axios from "axios";
const USER_URL = "http://localhost:8081";

const PLAN_URL = "http://localhost:8082";

const ANALYTICS_URL = "http://localhost:8083";

const RECOMMENDATION_URL =
  "http://localhost:8084";

const AUTH_URL =
  "http://localhost:8085";

// =====================================================
// 🔥 TOKEN HELPERS
// =====================================================

export const saveToken = (token) => {

  localStorage.setItem(
    "token",
    token
  );
};

export const saveRole = (role) => {

  localStorage.setItem(
    "role",
    role
  );
};

export const saveUser = (user) => {

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
};

export const getUser = () => {

  return JSON.parse(
    localStorage.getItem("user")
  );
};

export const getToken = () => {

  return localStorage.getItem(
    "token"
  );
};

export const getRole = () => {

  return localStorage.getItem(
    "role"
  );
};

export const logout = () => {

  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "role"
  );
};

// =====================================================
// 🔥 LOGIN API
// =====================================================

export const loginUser = async (
  credentials
) => {

  try {

    const res = await fetch(
      `${AUTH_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(
          credentials
        )
      }
    );

    if (!res.ok) {

      throw new Error(
        "Invalid credentials"
      );
    }

    return await res.json();

  } catch (error) {

    console.error(error);

    return null;
  }
};

// =====================================================
// 🔥 GET RECOMMENDATIONS
// =====================================================

export const getRecommendations =
  async (mobile) => {

    try {

      const res = await fetch(
        `${RECOMMENDATION_URL}/recommend/mobile/${mobile}`
      );

      if (!res.ok) {

        throw new Error(
          "Failed to fetch recommendations"
        );
      }

      return await res.json();

    } catch (error) {

      console.error(error);

      return [];
    }
  };

// =====================================================
// 🔥 GET ALL PLANS
// =====================================================

export const getPlans = async () => {

  try {

    const res = await fetch(
      `${PLAN_URL}/plans`
    );

    if (!res.ok) {

      throw new Error(
        "Failed to fetch plans"
      );
    }

    return await res.json();

  } catch (error) {

    console.error(error);

    return [];
  }
};

// =====================================================
// 🔥 DELETE PLAN
// =====================================================

export const deletePlan =
  async (id) => {

    try {

      const res = await fetch(
        `${PLAN_URL}/plans/${id}`,
        {
          method: "DELETE"
        }
      );

      return res.ok;

    } catch (error) {

      console.error(error);

      return false;
    }
  };

  // =====================================================
// 🔥 CREATE PLAN
// =====================================================

export const addPlan =
  async (plan) => {

    try {

      const res = await fetch(
        `${PLAN_URL}/plans`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            plan
          )
        }
      );

      if (!res.ok) {

        throw new Error(
          "Failed to add plan"
        );
      }

      return await res.json();

    } catch (error) {

      console.error(error);

      return null;
    }
  };

// =====================================================
// 🔥 UPDATE PLAN
// =====================================================

export const updatePlan =
  async (id, updatedPlan) => {

    try {

      const res = await fetch(
        `${PLAN_URL}/plans/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            updatedPlan
          )
        }
      );

      if (!res.ok) {

        throw new Error(
          "Failed to update plan"
        );
      }

      return await res.json();

    } catch (error) {

      console.error(error);

      return null;
    }
  };

// =====================================================
// 🔥 GET ANALYTICS
// =====================================================

export const getAnalytics =
  async (userId) => {

    try {

      const res = await fetch(
        `${ANALYTICS_URL}/analytics/trend/${userId}`
      );

      if (!res.ok) {

        throw new Error(
          "Failed to fetch analytics"
        );
      }

      return await res.text();

    } catch (error) {

      console.error(error);

      return "";
    }
  };

// =====================================================
// 🔥 CREATE USER
// =====================================================

export const createUser =
  async (user) => {

    try {

      console.log(
        "Sending user:",
        user
      );

      const res = await fetch(
        `${USER_URL}/users`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            user
          )
        }
      );

      console.log(
        "Response Status:",
        res.status
      );

      const data =
        await res.json();

      console.log(
        "Response Data:",
        data
      );

      if (!res.ok) {

        throw new Error(
          "Failed to create user"
        );
      }

      return data;

    } catch (error) {

      console.error(
        "CREATE USER ERROR:",
        error
      );

      return null;
    }
  };

// =====================================================
// 🔥 GET ALL USERS
// =====================================================

export const getUsers = async () => {

  try {

    const res = await fetch(
      `${USER_URL}/users`
    );

    if (!res.ok) {

      throw new Error(
        "Failed to fetch users"
      );
    }

    return await res.json();

  } catch (error) {

    console.error(error);

    return [];
  }

};

  // =====================================================
// 🔥 GET ANALYTICS USERS
// =====================================================

export const getAnalyticsUsers =
  async () => {

    try {

      const res = await fetch(
        `${USER_URL}/users/analytics`
      );

      if (!res.ok) {

        throw new Error(
          "Failed to fetch analytics users"
        );
      }

      return await res.json();

    } catch (error) {

      console.error(error);

      return [];
    }
  };

  export const getUserNotifications =
  async (userId) => {

    const response =
      await axios.get(

        `http://localhost:8081/notifications/user/${userId}`

      );

    return response.data;
};
  