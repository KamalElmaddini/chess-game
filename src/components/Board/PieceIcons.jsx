import React from 'react';

// Standard Chess Pieces (Wikimedia Commons SVGs)
const pieceUrls = {
    w: {
        p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
        r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
        n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
        b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
        q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
        k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg"
    },
    b: {
        p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
        r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
        n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
        b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
        q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
        k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
    }
};

export const PieceIcons = {
    w: {
        p: (props) => <img src={pieceUrls.w.p} alt="White Pawn" {...props} />,
        r: (props) => <img src={pieceUrls.w.r} alt="White Rook" {...props} />,
        n: (props) => <img src={pieceUrls.w.n} alt="White Knight" {...props} />,
        b: (props) => <img src={pieceUrls.w.b} alt="White Bishop" {...props} />,
        q: (props) => <img src={pieceUrls.w.q} alt="White Queen" {...props} />,
        k: (props) => <img src={pieceUrls.w.k} alt="White King" {...props} />
    },
    b: {
        p: (props) => <img src={pieceUrls.b.p} alt="Black Pawn" {...props} />,
        r: (props) => <img src={pieceUrls.b.r} alt="Black Rook" {...props} />,
        n: (props) => <img src={pieceUrls.b.n} alt="Black Knight" {...props} />,
        b: (props) => <img src={pieceUrls.b.b} alt="Black Bishop" {...props} />,
        q: (props) => <img src={pieceUrls.b.q} alt="Black Queen" {...props} />,
        k: (props) => <img src={pieceUrls.b.k} alt="Black King" {...props} />
    }
};
