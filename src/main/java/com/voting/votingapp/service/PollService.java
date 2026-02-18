package com.voting.votingapp.service;

import com.voting.votingapp.model.OptionVOte;
import com.voting.votingapp.model.Poll;
import com.voting.votingapp.repository.PollRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PollService {

    private final PollRepository pollRepository;

    public PollService(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    public Poll createPoll(Poll poll) {
        return pollRepository.save(poll);
    }

    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }

    public Optional<Poll> getPollById(Long pollId) {
        return pollRepository.findById(pollId);
    }

    public void vote(Long pollId, int optionIndex) throws IllegalAccessException {
        //Get Poll from DB
        Poll poll = pollRepository.findById(pollId).orElseThrow(() -> new RuntimeException("Poll Not Found"));

        //Get all options of this poll
        List<OptionVOte> options = poll.getOptions();

        //If index for vote is note valid, throw error
        if(optionIndex < 0 || optionIndex >= options.size()){
            throw new IllegalAccessException("Invalid option");
        }

        //Get selected Option
        OptionVOte selectedOption = options.get(optionIndex);

        //Increment vote count
        selectedOption.setVoteCount(selectedOption.getVoteCount() + 1);

        //Save incremented option into the DB
        pollRepository.save(poll);

    }
}
