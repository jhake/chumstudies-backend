const { Agenda, User } = require("../models");
const { loginCheck } = require("../utils/checks");
const { validateFile, destroyFile } = require("../utils/cloudinary");

module.exports = {
  Agenda: {
    user: async (agenda) => await User.findById(agenda.user),
  },

  Query: {
    allAgendas: async (_, __, context) => {
      loginCheck(context);

      const userId = context.user.id;

      const filter = { user: userId };

      return {
        data: await Agenda.find(filter),
      };
    },
  },

  Mutation: {
    createAgenda: async (_, args, context) => {
      loginCheck(context);

      const agenda = new Agenda({
        ...args,
        user: context.user.id,
      });

      await agenda.save();

      return agenda;
    },

    addAttachmentToAgenda: async (_, args, context) => {
      loginCheck(context);

      const agenda = await Agenda.findById(args.id);
      if (!agenda) throw Error("agenda not found");
      if (agenda.user != context.user.id) throw Error("not your agenda");
      if (agenda.attachment) throw Error("already has attachment");

      const cloudinaryObject = JSON.parse(args.attachment);

      if (!cloudinaryObject.public_id.includes(`Agenda_${args.id}`))
        throw Error("public_id not valid attachment for the agenda");

      await validateFile(args.attachment);
      agenda.attachment = args.attachment;

      return await agenda.save();
    },

    destroyAgenda: async (_, args, context) => {
      loginCheck(context);

      const agenda = await Agenda.findById(args.id);
      if (!agenda) throw Error("agenda not found");
      if (agenda.user != context.user.id) throw Error("not your agenda");

      if (agenda.attachment) await destroyFile(agenda.attachment);

      await Agenda.findByIdAndDelete(args.id);
      return true;
    },

    editAgenda: async (_, args, context) => {
      loginCheck(context);

      const agenda = await Agenda.findById(args.id);
      if (!agenda) throw Error("agenda not found");
      if (agenda.user != context.user.id) throw Error("not your agenda");

      return await Agenda.findByIdAndUpdate(
        args.id,
        {
          title: args.title,
          startsAt: args.startsAt,
          endsAt: args.endsAt,
          repeat: args.repeat,
          attachment: args.attachment,
          description: args.description,
          status: args.status,
        },
        { new: true }
      );
    },
  },
};
