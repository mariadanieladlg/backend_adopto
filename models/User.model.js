const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minLength: 3,
      maxLenght: 32,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // everything starts with user.
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
