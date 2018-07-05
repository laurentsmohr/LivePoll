
var addResultsToPoll = (poll, results) => {
  let totalVotes = 0;
  // Results.val() will be null, if no votes have been recorded
  if(results) {
    results = results.questions;
    poll.questions = poll.questions.map(question => {
      question.answers = question.answers.map(answer => {
        console.log('addResultsToPoll running... ');      
        try {
        console.log('try is running ...');
        let votes = results[question._id].aggregates[answer._id].vote_count;
        totalVotes += votes;
        answer.votes = votes;
        console.log('votes: ', votes);
        }
        catch (err) {
          console.log('catch is running...')
          console.error(err);
        }
        return answer;
      })
      return question;
    })
  }
  poll.total_answers = totalVotes;
  poll.active = false;
  poll.completed = true;
  return poll;
};

module.exports = addResultsToPoll;
