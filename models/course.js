'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Title" is required',
        },
        notNull: {
          msg: '"Title" is required',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '"Description" is required',
        },
        notNull: {
          msg: '"Description" is required',
        },
      },
    },
    estimatedTime:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {});
  Course.associate = function(models) {
    // associations can be defined here

    Course.belongsTo(models.User, {
      foreignKey: {
        fieldName: 'userId',
       allowNull: false,
      },
    });
  };
  return Course;
};