import "dotenv/config";

const secret = process.env.JWT_SECRET as string;

export default {
  jwt: {
    secret: process.env.NODE_ENV !== "test" ? secret : "mysecret",
    expiresIn: "1d",
  },
};
