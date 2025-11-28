import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from '../models/user.model.js'
import {uploadOnCoudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId) => {
    try {
       const user = await User.findById(userId)
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()

    // refreshToken ko database me save rakhenge taki user se barbar password na ask karna pade
    user.refreshToken = refreshToken //yaha user ke under de diya
    await user.save({validateBeforeSave: false})  // yaha save karadenge database me
    // validateBeforeSave: false isko islye use kiya taki userschema me humne likha hai password is required

    return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

// code for RegisterUser
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
    // console.log("email = ",email)

    // validation check -not empty
    // if(fullName === "") {
    //     throw new ApiError(400, "fullName is required")
    // }

    // aise bhaut sare if else ho jayenge to hum ek dusra method use karenge
    if(
        [username, fullName, email, password].some( (field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }
    // console.log(req.files)

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // or
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // upload them to cloudinar, avatar
    const avatar = await uploadOnCoudinary(avatarLocalPath)
    const coverImage = await uploadOnCoudinary(coverImageLocalPath)
    
    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
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

// code for loginUser
const loginUser = asyncHandler( async (req, res) =>{
    // get data from req body (req body -> data)
    /* username or email means here we check username or email available hai ya nhi 
    username ya email dono me se kisi ek v login karwa sakte hai (username or email) */ 
    // find the user (agar user nhi milta hai to bolenge user nhi hai) (find the user)
    // (agar user mil jata hai to password check karenge and agar password wrong hai to bolenge password wrong hai ) password check. (password check)
    // (aagar password right hai to) access and refresh token generate karenge (access and refresh token)
    // now we send access and refresh token in the form of cookie (secure cookie) (send cookie)
    // lastly send success fully login

    //get data from req body 
    const {username, email, password} = req.body

    // check 
    if(!username || !email){
        throw new ApiError(400, "username or email is required")
    }

    // (agar user mil jata hai to password check karenge and agar password wrong hai to bolenge password wrong hai ) password check
    // ya to email ya username mil jaye
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    // user agar nhi milta hai to 
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // password check
    // note:- User ye monodb ke mongoose ka ek object hai so humara banya hua user jo humare database me hai wo ye user hai
    const isPasswordValid = await user.isPasswordCorrect(password) // ye password req.body se nikala

    if(!isPasswordValid){
        throw new ApiError(401, "password incorrect ya we say invalid user credentials")
    }

    // (aagar password right hai to) access and refresh token generate karenge (access and refresh token)
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    // update karenge user ko 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // now we send access and refresh token in the form of cookie (secure cookie) (send in cookie)
    // so firstly we design options
    const options = {
        httpOnly: true,
        secure: true
    } // ye sirf server se modifiedable hoti hai 

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )


})

// code for logoutUser
const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

export {
    registerUser,
    loginUser,
    logoutUser
};
