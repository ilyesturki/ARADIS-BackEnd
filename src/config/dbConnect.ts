import mongoose from 'mongoose';

const dbConnect = () => {
  mongoose.connect(process.env.DB_URI).then(() => {
    console.log("Data Base Connected *.* ");
  });
};

export default dbConnect;