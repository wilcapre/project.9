'use strict';
const bcryptjs = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"firstName" is required',
        },
        notNull: {
          msg: '"firstName" is required',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"lastName" is required',
        },
        notNull: {
          msg: '"lastName" is required',
        },
      },
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"emailAddress" is required',
        },
        notNull: {
          msg: '"emailAddress" is required',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        if (value !== '' && value !== null) {
          // hashes the user's password before persisting the user to the database
          this.setDataValue('password', bcryptjs.hashSync(value))
        }
      },
      validate: {
        notEmpty: {
          msg: '"password" is required',
        },
        notNull: {
          msg: '"password" is required',
        },
      },
    },
  }, {});
  User.associate = function(models) {
    // associations can be defined here
      User.hasMany(models.Course, {
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        },
      });
    };
  return User;
};