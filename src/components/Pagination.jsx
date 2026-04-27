const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.last_page <= 1) return null;

    const { current_page, last_page, links } = meta;

    // Filter links to show only relevant ones (previous, next, and numbers)
    const filteredLinks = links.filter(link => {
        if (link.label.includes('Previous') || link.label.includes('Next')) return true;
        
        const pageNum = parseInt(link.label);
        // Show current page, and 1 page before/after
        return Math.abs(pageNum - current_page) <= 1 || pageNum === 1 || pageNum === last_page;
    });

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Showing page <span className="text-slate-900">{current_page}</span> of <span className="text-slate-900">{last_page}</span>
            </div>
            
            <div className="flex items-center gap-2">
                {links.map((link, index) => {
                    const isPrev = link.label.includes('Previous');
                    const isNext = link.label.includes('Next');
                    
                    // Skip link if URL is null and it's not a special button we want to show
                    if (!link.url && !isPrev && !isNext) return null;

                    const label = isPrev ? 'Prev' : isNext ? 'Next' : link.label;

                    return (
                        <button
                            key={index}
                            onClick={() => link.url && onPageChange(new URL(link.url).searchParams.get('page'))}
                            disabled={!link.url}
                            className={`
                                px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                ${link.active 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600'}
                                ${!link.url ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95'}
                            `}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Pagination;
