import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import {uploadOnCoudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation check -not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinar, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    // get user details from frontend
    const {username, fullName, email, password} = req.body
    console.log("email = ",email)

    // validation check -not empty
    // if(fullName === "") {
    //     throw new ApiError(400, "fullName is required")
    // }

    // aise bhaut sare if else ho jayenge to hum ek dusra method use karenge
    if(
        [username, fullName, email, password].some( () => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(40, "Avatar file is required")
    }

    // upload them to cloudinar, avatar
    const avatar = await uploadOnCoudinary(avatarLocalPath)
    const coverImage = await uploadOnCoudinary(coverImageLocalPath)
    if(!avatar) {
        throw new ApiError(40, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // yaha hum check karenge ki db me user create hua hai ki nhi and select method se remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {registerUser};