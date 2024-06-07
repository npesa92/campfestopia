import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { QuerySnapshot, Timestamp, collection, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';
import { fire } from './firebase';
import DateTimePicker from 'react-datetime-picker';

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled(Column)`
  justify-content: start;
  align-items: center;
  width: auto;
  height: 100vh;
  padding-left: 24px;
  padding-right: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 500px;
    width: 100%;
    padding-left: 2px;

    @media (max-width: 600px) {
      width: 80%;
    }
  }
`;

const SetListWrapper = styled(Column)`
  max-width: 500px;
  width: 100%;
  padding: 24px 12px;
`;

const DayWrapper = styled(Column)`
  margin-bottom: 24px;
`;

const Day = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 18px;
    font-weight: bold;
    padding: 8px 24px;
    border-radius: 24px;
    background-color: white;
  }
`;

const SetList = styled(Column)``;

const Set = styled(Column)`
  margin: 8px 24px;
  transition: 0.3s ease-in-out;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 8px;

  .material-icons {
    font-size: 12px;
    margin-right: 12px;
  }

  &.selected {
    margin: 24px 8px:
  }

  .name {
    font-weight: bold;
    padding: 12px 16px;

    .name-text {
      font-size: 16px;
      margin-bottom: 6px;
    }

    .note-text {
      color: rgba(0,0,0,0.64);
      font-size: 10px;
    }

    .time {
      display: flex;
      align-items: center;
      font-size: 12px;
      margin-top: 12px;

      .time-text {
        font-size: 14px;
        flex: 1;
      }
    }
  }
`;

const Reactions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px 12px 12px;
  /* grid-gap: 24px; */

  .emoji {
    border-radius: 24px;
    padding: 2px;
    font-size: 12px;
    outline: none;
    border: none;
    background: none;
  }
`;

const AddSetContainer = styled(Column)`
  margin: 8px 24px;
  background-color: rgba(255, 255, 255, 1);
`;

interface ReactionMap {
  [key: string]: number;
  fire: number;
  snake: number;
  pill: number;
  dawg: number;
}

interface ArtistSet {
  id: string;
  name: string;
  startTime: Timestamp;
  endTime: Timestamp;
  reactions: ReactionMap;
  note?: string;
}

interface SetTimeState {
  [key: string]: ArtistSet[];
}

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const App: React.FC = () => {

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const emojiMap: {[key: string]: string} = {
    fire: '🔥',
    snake: '🐍',
    pill: '💊',
    dawg: '🌭',
  };

  const defaultReactions = {
    fire: 0,
    snake: 0,
    pill: 0,
    dawg: 0,
  };
  
  const db = getFirestore(fire);

  let [setTimes, setSetTimes] = useState<SetTimeState>({});

  let [selectedSet, setSelectedSet] = useState<string | undefined>(undefined);

  let [startTimeInput, setStartTimeInput] = useState<Value>(new Date());
  let [endTimeInput, setEndTimeInput] = useState<Value>(new Date());

  useEffect(() => {
    const x = collection(db, 'sets');
    onSnapshot(x, onSetSnapshot);
  }, []);

  const onSetSnapshot = (docs: QuerySnapshot) => {
    const temp: ArtistSet[] = [];
    docs.forEach((doc) => {
      const data = doc.data();
      temp.push({
        id: doc.id,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        reactions: data.reactions ?? defaultReactions,
        note: data.note,
      });
    });
    temp.sort((a, b) => a.startTime.toDate().getTime() - b.startTime.toDate().getTime());
    const setsByDay = temp.reduce<SetTimeState>((acc, set) => {
      const date = set.startTime.toDate();
      const dayName = date.getHours() >= 11 ? dayNames[date.getDay()] : dayNames[date.getDay() - 1] || dayNames[6];
      console.log(dayName);
      if (!acc[dayName]) {
        acc[dayName] = [];
      }
      acc[dayName].push(set);
      return acc;
    }, {});
    setSetTimes(setsByDay);
  }

  const onSetClick = (id?: string) => () => {
    setSelectedSet(id);
  }

  const onEmojiClick = (set: ArtistSet, emoji: string) => async () => {
    const updated = {
      ...set,
      note: set.note ?? "",
      reactions: {
        ...set.reactions,
        [emoji]: set.reactions[emoji] + 1,
      }
    }

    await setDoc(doc(db, 'sets', set.id), updated);
  };

  return (
    <Container>
      <Header>
        <img src={'https://firebasestorage.googleapis.com/v0/b/npesa-sandbox.appspot.com/o/campfestopia.png?alt=media&token=c9ccb1d9-378b-46a5-9142-fa0721a65343'}/>
      </Header>
      <SetListWrapper>
        {Object.keys(setTimes).map((day) => {
          const sets = setTimes[day];
          return (
            <DayWrapper key={day}>
              <Day>
                <span>{day.toUpperCase()}</span>
              </Day>
              <SetList>
                {sets.map((set) => {
                  return (
                    <Set
                      key={set.id}
                      className={set.id === selectedSet ? 'selected' : 'not-selected'}
                      onClick={onSetClick(set.id)}
                    >
                      <div className={'name'}>
                        <div className={'name-text'}>{set.name}</div>
                        {set.note && <div className={'note-text'}>{set.note}</div>}
                        <div className={'time'}>
                          <span className="material-icons">schedule</span>
                          <span className={'time-text'}>
                            {set.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {set.endTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <Reactions>
                        {Object.keys(emojiMap).map((emoji) => {
                          return (
                            <button className={'emoji'} onClick={onEmojiClick(set, emoji)}>
                              {emojiMap[emoji]} {set.reactions ? `${set.reactions[emoji]}` : ''}
                            </button>
                          );
                        })}
                      </Reactions>
                    </Set>
                  );
                })}
              </SetList>
              {/* <AddSetContainer>
                <div>name: <input /></div>
              </AddSetContainer> */}
            </DayWrapper>
          )
        })}
      </SetListWrapper>
    </Container>
  );
}

export default App;
