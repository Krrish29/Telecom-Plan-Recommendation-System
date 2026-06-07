import React, { useState } from "react";

import { createUser } from "../services/api";

function Onboarding({ onUserAdded }) {

  const [user, setUser] =
    useState({

      userName: "",

      mobileNumber: "",

      city: "",

      planCategory: "DEFAULT"
    });

  const handleChange = (e) => {

    setUser({
      ...user,
      [e.target.name]:
        e.target.value
    });
  };

  const handleSubmit = async () => {

    if (
      !user.userName ||
      !user.mobileNumber ||
      !user.city
    ) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    const res =
      await createUser(user);

    if (res) {

      alert(
        "User added successfully!"
      );

      if (onUserAdded) {
        onUserAdded();
      }

      setUser({

        userName: "",

        mobileNumber: "",

        city: "",

        planCategory: "DEFAULT"
      });

    } else {

      alert(
        "Error creating user"
      );
    }
  };

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        {/* TOP SECTION */}
        <div style={styles.topSection}>

          <div>

            <div style={styles.badge}>
              Telecom User
            </div>

            <h2 style={styles.title}>
              Add New User
            </h2>

            <p style={styles.subtitle}>
              Create and onboard telecom
              users into the intelligent
              recommendation system
            </p>

          </div>

          <div style={styles.iconBox}>
            👤
          </div>

        </div>

        {/* FORM */}
        <div style={styles.formGrid}>

          {/* NAME */}
          <div>

            <label style={styles.label}>
              Full Name
            </label>

            <input
              type="text"

              name="userName"

              placeholder="Enter user name"

              value={user.userName}

              onChange={handleChange}

              style={styles.input}
            />

          </div>

          {/* MOBILE */}
          <div>

            <label style={styles.label}>
              Mobile Number
            </label>

            <input
              type="text"

              name="mobileNumber"

              placeholder="Enter mobile number"

              value={user.mobileNumber}

              onChange={handleChange}

              style={styles.input}
            />

          </div>

          {/* CITY */}
          <div>

            <label style={styles.label}>
              City
            </label>

            <input
              type="text"

              name="city"

              placeholder="Enter city"

              value={user.city}

              onChange={handleChange}

              style={styles.input}
            />

          </div>

          {/* CATEGORY */}
          <div>

            <label style={styles.label}>
              Plan Category
            </label>

            <select
              name="planCategory"

              value={
                user.planCategory
              }

              onChange={handleChange}

              style={styles.select}
            >

              <option value="DEFAULT">
                Default Plan
              </option>

              <option value="CUSTOMIZED">
                Customized Plan
              </option>

            </select>

          </div>

        </div>

        {/* BUTTON SECTION */}
        <div style={styles.bottomSection}>

          <button
            onClick={handleSubmit}

            style={styles.button}
          >
            ➕ Add User
          </button>

        </div>

      </div>

    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    justifyContent: "center",
    padding: "10px"
  },

  card: {
    width: "100%",
    maxWidth: "760px",

    background:
      "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))",

    borderRadius: "28px",

    padding: "34px",

    border:
      "1px solid rgba(148,163,184,0.12)",

    boxShadow:
      "0 10px 30px rgba(15,23,42,0.08)",

    boxSizing: "border-box"
  },

  topSection: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "34px",
    flexWrap: "wrap"
  },

  badge: {
    display: "inline-block",

    background:
      "linear-gradient(135deg, #e0f2fe, #dbeafe)",

    color: "#0369a1",

    padding: "8px 14px",

    borderRadius: "999px",

    fontSize: "12px",

    fontWeight: "700",

    marginBottom: "14px"
  },

  title: {
    fontSize: "34px",

    fontWeight: "800",

    color: "#0f172a",

    marginBottom: "10px",

    letterSpacing: "-0.6px"
  },

  subtitle: {
    color: "#64748b",

    fontSize: "15px",

    lineHeight: "1.7",

    maxWidth: "520px"
  },

  iconBox: {
    width: "74px",

    height: "74px",

    borderRadius: "22px",

    background:
      "linear-gradient(135deg, #0369a1, #0891b2)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontSize: "34px",

    color: "white",

    boxShadow:
      "0 10px 24px rgba(3,105,161,0.22)"
  },

  formGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",

    gap: "22px",

    marginBottom: "30px"
  },

  label: {
    display: "block",

    marginBottom: "10px",

    fontSize: "14px",

    fontWeight: "700",

    color: "#334155"
  },

  input: {
    width: "100%",

    padding: "16px",

    borderRadius: "16px",

    border:
      "1px solid #dbeafe",

    background: "#f8fafc",

    fontSize: "15px",

    outline: "none",

    transition: "0.3s",

    boxSizing: "border-box",

    color: "#0f172a"
  },

  select: {
    width: "100%",

    padding: "16px",

    borderRadius: "16px",

    border:
      "1px solid #dbeafe",

    background: "#f8fafc",

    fontSize: "15px",

    outline: "none",

    transition: "0.3s",

    boxSizing: "border-box",

    color: "#0f172a"
  },

  bottomSection: {
    display: "flex",
    justifyContent: "flex-end"
  },

  button: {
    border: "none",

    padding: "16px 28px",

    borderRadius: "16px",

    background:
      "linear-gradient(135deg, #0369a1 0%, #0891b2 100%)",

    color: "white",

    fontWeight: "700",

    fontSize: "15px",

    cursor: "pointer",

    boxShadow:
      "0 10px 24px rgba(3,105,161,0.20)",

    transition: "0.3s"
  }

};

export default Onboarding;