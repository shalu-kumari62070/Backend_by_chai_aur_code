const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler}


// now we see how to write same code in try catch way

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {} means (func) => {() => {}}
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (requestHandler) => async(req, res, next) => {
//     try {
//         await requestHandler(req, res, next)
//     } catch (error) {
//         // err.code means agar user error pass kar raha hai  500 means agar user error pass na kar raha ho tab
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }