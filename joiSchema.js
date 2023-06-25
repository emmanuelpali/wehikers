const Joi = require('joi');

module.exports.validateHike = Joi.object({
      hike: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required()
      }).required()
    });