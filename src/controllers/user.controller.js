import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh and Access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Step 1: Get user details form frontend
  const { username, email, fullName, password } = req.body;

  // console.log(req.body);

  // Step 2: Validations
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
    //The above piece of line checks whether all fields are filled in or not. If not then it will throw an error.
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Step 3: Check if user already exists: username, email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log(existedUser);

  if (existedUser) {
    throw new ApiError(409, "User with same username or email already exists");
  }

  // Step 4: Check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //Method 1:
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //Method 2:
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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

const loginUser = asyncHandler(async (req, res) => {
  // Steps for loginUser

  // Get data from req body
  const { email, username, password } = req.body;

  // Get username or email
  if (!username || !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  // Find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check for password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // If match found then generate a new access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // Send access and refresh token in secured cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //We need to design options (basically like an object) of cookies
  const options = {
    httpOnly: true, //It will make sure that the cookie is not accessible via JavaScript
    secure: true, //Cookie will not be modifiable however it can be seen
  };

  // Send Response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"));
});

export { registerUser, loginUser, logoutUser };
