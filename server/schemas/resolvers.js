const { AuthenticationSerror } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        //getting the user
        me: async (parent, args, context) => {
            if(context.user) {
                //gets the user by Id thought selecting the correct password
                const userData = await User.findOne({ _id: context.user._id}).select('-__V -password');

                //returns user's information
                return userData;
            }

            throw new AuthenticationSerror('Must Log in...');
        },
    },

    Mutation: {
        login: async (parent, {email, password}) => {
            //getting user details through user email. 
            const user = await User.findOne({email});

            if(!user) {
                throw new AuthenticationSerror('This user does not exist...');
            }
            //password entry tp get user info
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationSerror('Incorrect password...');
            }

            //creates token connect to user
            const token = signToken(user);

            return {token, user};
        },
        addUser: async (parent, args) => {
            //passing in argument to create new users
            const user = await User.create(args);
            const token = signToken(user);
            return {token, user};
        },
        saveBook: async (parent, {bookData}, context) => {
            if(context.user) {
                //updating user book data thought user id
                const updateUser = await User.findByIdAndUpdate(
                    //_id is the context
                    {_id: context.user._id},
                    //adding teh new booddata with push
                    {$push: {savedBooks: bookData} },
                    //makes sure server knows its a new entry
                    { new: true }
                );
                return updateUser;
            }
            throw new AuthenticationSerror('Try logging in...');
        },
        removeBook: async (parent, {bookId}, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    //same ide as saving book but user pull to remove entry by the bookId
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
        },
    },
};

module.exports = resolvers;