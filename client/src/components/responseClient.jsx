import React from 'react';
import ip from 'ip';
import {firepoll} from '../firepollManagementClient'
import firePollResponseClient from '../firepollResponseClient'

class ResponseClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      poll: false,
      questions: false,
      answers: false,
      currChoice: 1,
      alreadyVoted: false,
      results: false,
      user_id: 1,
      exists: true,
      active: false,
      completed: false
    };
  };

  componentDidMount() {
      var pollId = this.props.match.params.id;
      console.log("pollID: ", pollId);
      // CHECK POLL STATUS
      firePollResponseClient.get.pollStatus(pollId).then((data) => {
        if (data !== undefined) {
          this.setState({
            active: data.active,
            completed: data.completed
          })        
        
          // GET POLL & SETUP LISTENER
          firepoll.get.poll(pollId).then((data) => {
            this.setState({
              poll: data
            }, () => {
              firepoll.listen.poll(this.state.poll, (data) => {
                this.setState({
                  poll: data
                }, () => {
                  firepoll.get.allQuestionsFromPoll(pollId).then((data) => {
                    this.setState({
                      questions: data,
                      currChoice: JSON.stringify(data[0].answers[0])
                    });
                  }).catch((err) => {console.log(err)});
                });
              });
            });
          })

          // GET ALL QUESTIONS & SETUP LISTENER
          firepoll.get.allQuestionsFromPoll(pollId).then((data) => {
            this.setState({
              questions: data
            }, () => {
              firepoll.listen.question(this.state.poll.id, this.state.questions, () => {
                firepoll.get.allQuestionsFromPoll(this.state.poll.id).then((data) => {
                  this.setState({
                    questions: data
                  });
                });
              });
            });
          });
        } else {
          this.setState({exists: false})
        }
      })
  };

  handleUserChoice = (response) => {
    this.setState({
      currChoice: response.target.value
    });
  }

  handleSubmit = (e, question) => {
    e.preventDefault();

    const answer = JSON.parse(this.state.currChoice);

    this.setState({user_id: this.state.user_id+1});
//|| ip.address().replace(/\./g , "")
    let userAnswer = {
      poll_id: this.state.poll.id,
      answer_id: answer.id,
      answer_value: answer.value,
      user_id: this.state.user_id,
      question_id: question.id,
      question_title: question.question_title,
      question_type: question.type
    }

    if (this.state.alreadyVoted === false) {
      this.setState({
        alreadyVoted: false
      });
    }

    firePollResponseClient.get.results(this.state.poll.id, question.id).then((data) => {
      this.setState({
        results: data
      });
    });

    firePollResponseClient.listen.results(this.state.poll.id, question.id, (data) => {
      this.setState({
        results: data
      });
    });

    firePollResponseClient.vote.submit(userAnswer).then(() => {
      console.log('Thanks for voting');
    })
  }

  // GETS RENDERED IF POLL IS LIVE
  renderLivePoll = () => {
    return (
      <div id="poll-dist" className = "poll-dist-class">
      {this.state.poll ? <div>
          <h1 className="title is-4">{this.state.poll.title}</h1>
        { 
          this.state.questions ? this.state.questions.map((question) => {
            return (
              <div>
                <div className="title is-3">{question.question_title}</div>
                <form className="field control flex" key={question.id}>
                  <select className="select is-danger is-rounded is-medium" onChange = {(val) => {this.handleUserChoice(val)}}>
                    {question.answers.map((answer, i) => {
                      return (
                        <option key={i} value = {JSON.stringify(answer)}>{answer.value}</option>
                      );
                    })}
                  </select>
                {this.state.alreadyVoted ? <div></div> : <button className="button is-danger is-rounded is-medium" onClick = {(e) => {this.handleSubmit(e, question)}}>Select Answer</button>}
              </form>
  
              </div>
              );
          })
          : <div></div>
        }
        {
          this.state.results ? this.state.results.map((result) => {
            let total = this.state.results.reduce((acc, ele) => acc + ele.vote_count, 0);
            const isLit = '🔥'.repeat(Math.floor(result.vote_count / total *10));
            return (
            <div className = "title is-5 flex results">
                <span>{result.answer_value}</span>
                <span>{isLit}</span>
                <span>{result.vote_count}</span>
            </div>
            )}
          ) : <div></div>
        }
      </div> : ''}
      </div>
      );
  }


  render() {
    if(this.state.active === true) {
      this.renderLivePoll();
    } else {
      let isScheduledText = "This poll is not yet live. Please wait for the host to start the poll and refresh this page.";
      let doesNotExistText = "We can't find the poll you are looking for. Try checking the link for typos.";
      let isCompleteText = "This poll is complete. Thank you for participating.";
      let status = this.state.exists === false ? doesNotExistText : this.state.completed === true ? isCompleteText : isScheduledText;
      return (
        <div className="responseClient" style={{margin: "40px 0 0 0"}}>
          <div className="box" style={{maxWidth: "600px", minHeight: "600px", margin: "0 auto", textAlign: "center"}} id="app">
            <p>{status}</p>
          </div>
        </div>
      ) 
    }
  }
}

export default ResponseClient;