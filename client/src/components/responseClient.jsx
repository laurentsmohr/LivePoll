import React from 'react';
import firePollManagementClient from '../firepollManagementClient'
import firePollResponseClient from '../firepollResponseClient'

class ResponseClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      poll: false,
      questions: false,
      answers: false,
      currChoice: 1,
      alreadyVoted: false
    };
  };

  componentDidMount() {

      // GET POLL & SETUP LISTENER
      firePollManagementClient.get.poll('YROTzLFtNPbhxlAGVbAx').then((data) => {
        this.setState({
          poll: data
        }, () => {
          firePollManagementClient.listen.poll(this.state.poll, (data) => {
            this.setState({
              poll: data
            }, () => {
              firePollManagementClient.get.allQuestionsFromPoll('YROTzLFtNPbhxlAGVbAx').then((data) => {
                this.setState({
                  questions: data
                });
              }).catch((err) => {console.log(err)});
            });
          });
        });
      })

      // GET ALL QUESTIONS & SETUP LISTENER
      firePollManagementClient.get.allQuestionsFromPoll('YROTzLFtNPbhxlAGVbAx').then((data) => {
        this.setState({
          questions: data
        }, () => {
          firePollManagementClient.listen.question(this.state.poll.id, this.state.questions, () => {
            firePollManagementClient.get.allQuestionsFromPoll(this.state.poll.id).then((data) => {
              this.setState({
                questions: data
              });
            });
          });
        });
      });
  };

  handleUserChoice(response) {
    this.setState({
      currChoice: response.target.value
    });
  }

  handleSubmit(e, question_id) {
    e.preventDefault();

    const answer = JSON.parse(this.state.currChoice);

    console.log(JSON.stringify(answer));

    let userAnswer = {
      poll_id: this.state.poll.id,
      answer_id: answer.position,
      answer_value: answer.value,
      user_id: 'ANOTHER DIFFERENT TEST USER ID',
      question_id: question_id,
    }

    if (this.state.alreadyVoted === false) {
      this.setState({
        alreadyVoted: true
      });
    }

    firePollResponseClient.vote.submit(userAnswer).then(() => {
      console.log('Thanks for voting');
    })
  }

  render() {
    return (
    <div> 
        <h1>{this.state.poll ? this.state.poll.title : ''}</h1>
      { 
        this.state.questions ? this.state.questions.map((question) => {
          return (
            <form key={question.id}>
              <select onChange = {(val) => {this.handleUserChoice(val)}}>
                {question.answers.map((answer, i) => {
                  return (
                    <option key={i} value = {JSON.stringify(answer)}>{answer.value}</option>
                  );
                })}
              </select>
              <button onClick = {(e) => {this.handleSubmit(e, question.id)}}>Select Answer</button>
            </form>
            );
        })
        : <div></div>
      }
    </div>
    );
  }
}

export default ResponseClient;