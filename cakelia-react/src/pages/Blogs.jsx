import { Link } from 'react-router-dom'
import Header from '../components/Header'

const blogs = [
  {
    id: 1,
    title: 'Why Virtual Cakes Are the Future of Celebrations',
    author: 'Anes | Cakelia.com',
    date: 'May 12, 2024',
    excerpt: 'Celebrations are evolving, and virtual cakes are taking center stage in the digital age. Whether...',
    image: '/img/BLOGS/blog001.png',
  },
  {
    id: 2,
    title: 'What Does Your Cake Design Say About You?',
    author: 'Anes | Cakelia.com',
    date: 'May 07, 2024',
    excerpt: 'Ever wondered what your cake design says about your personality? At Cakelia, we believe that cakes...',
    image: '/img/BLOGS/blog002.png',
  },
  {
    id: 3,
    title: 'Blowing Out Candles Virtually: The Weird and Wonderful Psychology Behind It',
    author: 'Anes | Cakelia.com',
    date: 'May 01, 2024',
    excerpt: 'Blowing out candles on a cake is one of the most beloved traditions across the world. But have you...',
    image: '/img/BLOGS/blog003.png',
  },
  {
    id: 4,
    title: "Famous Cakes in History (And How They'd Look in Cakelia)",
    author: 'Anes | Cakelia.com',
    date: 'April 27, 2024',
    excerpt: 'Cakes have been at the center of major historical moments for centuries. From royal weddings to...',
    image: '/img/BLOGS/blog004.png',
  },
]

export default function Blogs() {
  return (
    <>
      <Header />
      <main className="main">
        <div className="breadcrumb-blogs">
          <Link to="/">Home</Link> &gt; <span>Blog</span>
        </div>
        <section className="blog-container">
          {blogs.map(blog => (
            <article className="blog-post" key={blog.id}>
              <div className="blog-content">
                <Link to={`/blog/${blog.id}`}><h2>{blog.title}</h2></Link>
                <p className="meta">Published by {blog.author} on {blog.date}</p>
                <Link to={`/blog/${blog.id}`}><p className="excerpt">{blog.excerpt}</p></Link>
                <Link to={`/blog/${blog.id}`} className="read-more">Read More →</Link>
                <Link to={`/blog/${blog.id}`}>
                  <img src={blog.image} alt={blog.title} />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}
