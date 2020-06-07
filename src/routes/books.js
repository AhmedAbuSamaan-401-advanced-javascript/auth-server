'use strict';

const express = require('express');
const router = express.Router();

router.get('/books', handleGetAll);
router.get('/books/:id', handleGetOne);

// Route Handlers
function handleGetAll(req, res, next) {
  let books = {
    count: 3,
    results: [
      { title:'class1' },
      { title:'class2' },
      { title: 'class3' },
    ],
  };
  res.status(200).json(books);
}

function handleGetOne(req, res, next) {
  let book = {
    title:'javascript',
  };
  res.status(200).json(book);
}

module.exports = router;