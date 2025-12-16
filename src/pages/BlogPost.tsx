import { useLocation, useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ArticleSchema } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Facebook, Twitter, Linkedin, Mail } from "lucide-react";
import { format } from "date-fns";
import Footer from "@/components/Footer";

export default function BlogPost() {
  const location = useLocation();
  const navigate = useNavigate();
  const post = location.state?.post;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);
  const shareMailto = `mailto:?subject=${shareTitle}&body=${shareUrl}`;

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags.join(", ")}
        ogType="article"
        ogImage={post.imageUrl}
      />

      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        author={post.author}
        publishedDate={post.publishedDate}
        modifiedDate={post.publishedDate}
        imageUrl={post.imageUrl}
        url={window.location.href}
      />

      <main className="min-h-screen bg-background">
        <article className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span>By {post.author}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.publishedDate), "MMMM dd, yyyy")}
                </span>
              </div>

              {/* Social Share */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Share:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank")}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, "_blank")}
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`, "_blank")}
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = shareMailto)}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </header>

            {/* Featured Image */}
            <div
              className="w-full h-96 bg-cover bg-center rounded-lg mb-8"
              style={{ backgroundImage: `url(${post.imageUrl})` }}
            />

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12 whitespace-pre-wrap break-words">
              {post.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* CTA Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Start Tracking Flight Prices</h3>
                <p className="text-muted-foreground mb-6">
                  Get instant alerts when prices drop to your favorite destinations. It's free!
                </p>
                <Button size="lg" asChild>
                  <Link to="/signup">Sign Up for Free</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </article>

        <Footer />
      </main>
    </>
  );
}
