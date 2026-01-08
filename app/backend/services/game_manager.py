from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import random
import string


@dataclass
class Player:
    """
    Játékos adatai
    """
    nickname: str
    connection_id: str
    score: int = 0
    answers: Dict[int, dict] = field(default_factory=dict)
    connected: bool = True
    joined_at: datetime = field(default_factory=datetime.now)


@dataclass
class QuestionState:
    """
    Aktuális kérdés állapota
    """
    question_index: int
    question_data: dict
    started_at: datetime
    answers_received: Dict[str, dict] = field(default_factory=dict)
    finished: bool = False


@dataclass
class GameSession:
    """
    Egy játék session állapota
    """
    game_code: str
    quiz_id: int
    host_user_id: int
    created_at: datetime = field(default_factory=datetime.now)
    
    players: Dict[str, Player] = field(default_factory=dict)
    
    status: str = "waiting"  # waiting, playing, finished
    current_question_index: int = -1
    current_question: Optional[QuestionState] = None
    
    quiz_data: Optional[dict] = None
    questions: List[dict] = field(default_factory=list)


class GameManager:
    """
    In-memory játék session kezelő
    """
    
    def __init__(self):
        self.sessions: Dict[str, GameSession] = {}
        self.connection_to_session: Dict[str, str] = {}
    
    def generate_game_code(self) -> str:
        """
        6 jegyű egyedi játék kód generálása
        """
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if code not in self.sessions:
                return code
    
    def create_session(self, quiz_id: int, host_user_id: int, quiz_data: dict) -> GameSession:
        """
        Új játék session létrehozása
        """
        game_code = self.generate_game_code()
        session = GameSession(
            game_code=game_code,
            quiz_id=quiz_id,
            host_user_id=host_user_id,
            quiz_data=quiz_data,
            questions=quiz_data.get('questions', [])
        )
        self.sessions[game_code] = session
        return session
    
    def get_session(self, game_code: str) -> Optional[GameSession]:
        """
        Session lekérése kód alapján
        """
        return self.sessions.get(game_code)
    
    def get_session_by_connection(self, connection_id: str) -> Optional[GameSession]:
        """
        Session lekérése connection ID alapján
        """
        game_code = self.connection_to_session.get(connection_id)
        if game_code:
            return self.sessions.get(game_code)
        return None
    
    def join_session(self, game_code: str, nickname: str, connection_id: str) -> tuple[bool, str]:
        """
        Játékos csatlakozása sessionhöz
        """
        session = self.get_session(game_code)
        
        if not session:
            return False, "Nem létezik ilyen játék kód"
        
        if session.status not in ["waiting", "playing"]:
            return False, "A játék már véget ért"
        
        if nickname in session.players:
            existing_player = session.players[nickname]
            
            if not existing_player.connected:
                old_connection_id = existing_player.connection_id
                existing_player.connection_id = connection_id
                existing_player.connected = True
                
                if old_connection_id in self.connection_to_session:
                    del self.connection_to_session[old_connection_id]
                self.connection_to_session[connection_id] = game_code
                
                return True, f"Újracsatlakoztál: {nickname}"
            else:
                return False, "Ez a becenév már foglalt (a játékos jelenleg online)"
        
        player = Player(nickname=nickname, connection_id=connection_id)
        session.players[nickname] = player
        self.connection_to_session[connection_id] = game_code
        
        return True, f"Sikeresen csatlakoztál: {nickname}"
    
    def disconnect_player(self, connection_id: str):
        """
        Játékos lecsatlakozásának jelzése
        """
        session = self.get_session_by_connection(connection_id)
        if session:
            for player in session.players.values():
                if player.connection_id == connection_id:
                    player.connected = False
                    break
        
        if connection_id in self.connection_to_session:
            del self.connection_to_session[connection_id]
    
    def start_question(self, game_code: str, question_index: int) -> bool:
        """
        Új kérdés indítása
        """
        session = self.get_session(game_code)
        if not session or question_index < 0 or question_index >= len(session.questions):
            return False

        if session.current_question and not session.current_question.finished and session.current_question_index == question_index:
            return False

        if session.status == "waiting":
            if question_index != 0:
                return False
        else:
            expected_next = session.current_question_index + 1
            if question_index != expected_next:
                return False
        
        session.status = "playing"
        session.current_question_index = question_index
        
        question_data = session.questions[question_index].copy()
        
        if question_data.get('question_type') == 'order' and 'options' in question_data:
            original_options = question_data['options']
            original_correct_answer = question_data.get('correct_answer', '[]')
            
            import json
            try:
                correct_order = json.loads(original_correct_answer)
            except:
                correct_order = list(range(len(original_options)))
            
            shuffled_indices = list(range(len(original_options)))
            random.shuffle(shuffled_indices)
            
            question_data['options'] = [original_options[i] for i in shuffled_indices]
            
            new_correct_order = []
            for original_idx in correct_order:
                new_position = shuffled_indices.index(original_idx)
                new_correct_order.append(new_position)
            
            question_data['correct_answer'] = json.dumps(new_correct_order)
        
        session.current_question = QuestionState(
            question_index=question_index,
            question_data=question_data,
            started_at=datetime.now()
        )
        
        return True
    
    def submit_answer(self, game_code: str, nickname: str, answer: str) -> bool:
        """
        Válasz beküldése
        """
        session = self.get_session(game_code)
        if not session or not session.current_question:
            return False
        
        if nickname not in session.players:
            return False
        
        session.current_question.answers_received[nickname] = {
            'answer': answer,
            'time': datetime.now()
        }
        
        return True
    
    def finish_question(self, game_code: str) -> Dict[str, dict]:
        """
        Kérdés lezárása és pontszámítás
        """
        session = self.get_session(game_code)
        if not session or not session.current_question:
            return {}
        
        current_q = session.current_question
        question_data = current_q.question_data
        
        correct_answer = question_data.get('correct_answer')
        base_points = question_data.get('points', 10)
        speed_bonus = question_data.get('speed_bonus', True)
        question_type = question_data.get('question_type')
        
        results = {}
        correct_players = []
        
        for nickname, answer_data in current_q.answers_received.items():
            player_answer = answer_data['answer']
            answer_time = answer_data['time']
            
            is_correct = self._check_answer(question_type, player_answer, correct_answer)
            
            if is_correct:
                correct_players.append((nickname, answer_time, player_answer))
            else:
                results[nickname] = {
                    'correct': False,
                    'points': 0,
                    'rank': None,
                    'answer': player_answer,
                    'was_online': True
                }
                session.players[nickname].answers[current_q.question_index] = {
                    'correct': False,
                    'points': 0,
                    'rank': None,
                    'answer': player_answer,
                    'was_online': True
                }
        
        if correct_players:
            correct_players.sort(key=lambda x: x[1])
            
            for rank, (nickname, _, player_answer) in enumerate(correct_players, 1):
                bonus = 0
                if speed_bonus and rank <= 3:
                    bonus = {1: 3, 2: 2, 3: 1}.get(rank, 0)
                
                total_points = base_points + bonus
                
                results[nickname] = {
                    'correct': True,
                    'points': total_points,
                    'rank': rank if speed_bonus and rank <= 3 else None,
                    'answer': player_answer,
                    'was_online': True
                }
                
                session.players[nickname].score += total_points
                session.players[nickname].answers[current_q.question_index] = results[nickname]
        
        for nickname, player in session.players.items():
            if nickname not in results:
                was_online = player.connected
                
                results[nickname] = {
                    'correct': False,
                    'points': 0,
                    'rank': None,
                    'answer': None,
                    'was_online': was_online
                }
                session.players[nickname].answers[current_q.question_index] = {
                    'correct': False,
                    'points': 0,
                    'rank': None,
                    'answer': None,
                    'was_online': was_online
                }
        
        current_q.finished = True
        return results
    
    def _check_answer(self, question_type: str, player_answer: str, correct_answer: str) -> bool:
        """
        Válasz helyességének ellenőrzése
        """
        if question_type == 'single_choice':
            return str(player_answer) == str(correct_answer)
        elif question_type == 'multiple_choice':
            import json
            try:
                player_ans = json.loads(player_answer) if isinstance(player_answer, str) else player_answer
                correct_ans = json.loads(correct_answer) if isinstance(correct_answer, str) else correct_answer
                return sorted(player_ans) == sorted(correct_ans)
            except:
                return False
        elif question_type == 'number':
            try:
                return abs(float(player_answer) - float(correct_answer)) < 0.01
            except:
                return False
        elif question_type == 'order':
            import json
            try:
                player_ans = json.loads(player_answer) if isinstance(player_answer, str) else player_answer
                correct_ans = json.loads(correct_answer) if isinstance(correct_answer, str) else correct_answer
                return player_ans == correct_ans
            except:
                return False
        return False
    
    def get_leaderboard(self, game_code: str, limit: int = 10, include_question_details: bool = False) -> List[dict]:
        """
        Ranglista lekérése
        """
        session = self.get_session(game_code)
        if not session:
            return []
        
        leaderboard = []
        for nickname, player in session.players.items():
            correct_answers = sum(1 for ans in player.answers.values() if ans.get('correct', False))
            total_answers = len(player.answers)
            
            entry = {
                'nickname': nickname,
                'score': player.score,
                'correct_answers': correct_answers,
                'total_answers': total_answers,
                'rank': 0
            }
            
            if include_question_details:
                entry['question_scores'] = player.answers
            
            leaderboard.append(entry)
        
        leaderboard.sort(key=lambda x: x['score'], reverse=True)
        
        for idx, entry in enumerate(leaderboard[:limit], 1):
            entry['rank'] = idx
        
        return leaderboard[:limit]
    
    def finish_game(self, game_code: str):
        """
        Játék befejezése
        """
        session = self.get_session(game_code)
        if session:
            session.status = "finished"
    
    def delete_session(self, game_code: str):
        """
        Session törlése
        """
        if game_code in self.sessions:
            session = self.sessions[game_code]
            
            for player in session.players.values():
                if player.connection_id in self.connection_to_session:
                    del self.connection_to_session[player.connection_id]
            del self.sessions[game_code]


game_manager = GameManager()
