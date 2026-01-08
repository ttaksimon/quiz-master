import { FaStar } from 'react-icons/fa';

const RenderStars = ({ rating, totalRatings }) => {
    if (!rating || rating === 0 || totalRatings === 0) {
        return <span className="text-muted">Nincs értékelés</span>;
    }
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <>
        {[...Array(fullStars)].map((_, i) => (
            <FaStar key={`full-${i}`} className="text-warning" />
        ))}
        {hasHalfStar && <FaStar className="text-warning" style={{ opacity: 0.5 }} />}
        {[...Array(emptyStars)].map((_, i) => (
            <FaStar key={`empty-${i}`} className="text-muted" />
        ))}
        <span className="ms-1">({rating.toFixed(1)})</span>
        </>
    );
}

export default RenderStars;