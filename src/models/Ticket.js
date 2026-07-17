const mongoose = require("mongoose");

const {
  TICKET_TYPE_VALUES,
  TICKET_PRIORITY_VALUES,
  TICKET_STATUS_VALUES,
  TICKET_STATUSES,
} = require("../constants/ticket.constants");

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 2000,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const attachmentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
    trim: true,
  },

  storedName: {
    type: String,
    required: true,
    trim: true,
  },

  mimeType: {
    type: String,
    required: true,
    trim: true,
  },

  size: {
    type: Number,
    required: true,
    min: 1,
  },

  path: {
    type: String,
    required: true,
    trim: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const statusHistorySchema = new mongoose.Schema({
  previousStatus: {
    type: String,
    enum: TICKET_STATUS_VALUES,
  },

  newStatus: {
    type: String,
    enum: TICKET_STATUS_VALUES,
    required: true,
  },

  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  changedAt: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    protocol: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: /^CH-\d{4}-\d{6}$/,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },

    type: {
      type: String,
      enum: TICKET_TYPE_VALUES,
      required: true,
    },

    priority: {
      type: String,
      enum: TICKET_PRIORITY_VALUES,
      required: true,
    },

    status: {
      type: String,
      enum: TICKET_STATUS_VALUES,
      default: TICKET_STATUSES.OPEN,
      required: true,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    comments: {
      type: [commentSchema],
      default: [],
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({
  requester: 1,
  createdAt: -1,
});

ticketSchema.index({
  status: 1,
  createdAt: -1,
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;