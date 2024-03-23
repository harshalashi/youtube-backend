import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Step 1: Get user details form frontend
  const { username, email, fullName, password } = req.body;

  console.log(req.body);

  // Step 2: Validations
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
    //The above piece of line checks whether all fields are filled in or not. If not then it will throw an error.
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Step 3: Check if user already exists: username, email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with same username or email already exists");
  }

  // Step 4: Check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }

  // Step 5: Upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Step 6: Create user object - Create entry in DB
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Step 7: Remove password and refresh token field from response
  // Checking finally user has been created or not.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Step 8: Check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  // Step 9: Return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
