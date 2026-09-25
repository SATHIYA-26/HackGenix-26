"""Initial Schema with Feedback, NLP Analysis, Embeddings, Clusters, Trends, Recommendations, and Insights

Revision ID: 0001_initial
Revises: 
Create Date: 2026-09-25 10:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. feedback table
    op.create_table(
        'feedback',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('feedback_id', sa.String(length=128), nullable=False),
        sa.Column('source', sa.String(length=64), nullable=False),
        sa.Column('source_url', sa.String(length=512), nullable=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('created_at_db', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_feedback_feedback_id'), 'feedback', ['feedback_id'], unique=True)
    op.create_index(op.f('ix_feedback_source'), 'feedback', ['source'], unique=False)
    op.create_index(op.f('ix_feedback_created_at'), 'feedback', ['created_at'], unique=False)

    # 2. feedback_analysis table
    op.create_table(
        'feedback_analysis',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('feedback_id', sa.String(length=128), nullable=False),
        sa.Column('sentiment', sa.String(length=32), nullable=False),
        sa.Column('sentiment_confidence', sa.Float(), nullable=False),
        sa.Column('intent', sa.String(length=64), nullable=False),
        sa.Column('intent_confidence', sa.Float(), nullable=False),
        sa.Column('cleaned_text', sa.Text(), nullable=False),
        sa.Column('language', sa.String(length=16), nullable=False),
        sa.Column('is_noise', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_duplicate', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('duplicate_of', sa.String(length=128), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['feedback_id'], ['feedback.feedback_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_feedback_analysis_feedback_id'), 'feedback_analysis', ['feedback_id'], unique=True)

    # 3. feedback_embeddings table
    op.create_table(
        'feedback_embeddings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('feedback_id', sa.String(length=128), nullable=False),
        sa.Column('embedding', sa.Text(), nullable=False),
        sa.Column('model_name', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['feedback_id'], ['feedback.feedback_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_feedback_embeddings_feedback_id'), 'feedback_embeddings', ['feedback_id'], unique=True)

    # 4. problem_clusters table
    op.create_table(
        'problem_clusters',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('feedback_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('average_sentiment', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('growth_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('severity', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('user_impact', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('priority_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('frequency_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('severity_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('growth_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('user_impact_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('negative_sentiment_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('product_dimension', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_problem_clusters_name'), 'problem_clusters', ['name'], unique=False)
    op.create_index(op.f('ix_problem_clusters_priority_score'), 'problem_clusters', ['priority_score'], unique=False)

    # 5. problem_feedback association table
    op.create_table(
        'problem_feedback',
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('feedback_id', sa.String(length=128), nullable=False),
        sa.Column('relevance_score', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['feedback_id'], ['feedback.feedback_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_id'], ['problem_clusters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('problem_id', 'feedback_id'),
    )

    # 6. trends table
    op.create_table(
        'trends',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('time_window', sa.String(length=32), nullable=False),
        sa.Column('current_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('previous_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('growth_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('is_emerging', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('calculated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['problem_id'], ['problem_clusters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_trends_problem_id'), 'trends', ['problem_id'], unique=False)
    op.create_index(op.f('ix_trends_is_emerging'), 'trends', ['is_emerging'], unique=False)

    # 7. recommendations table
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('recommendation', sa.Text(), nullable=False),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('evidence', sa.JSON(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.85'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['problem_id'], ['problem_clusters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_recommendations_problem_id'), 'recommendations', ['problem_id'], unique=False)

    # 8. insights table
    op.create_table(
        'insights',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('problem_id', sa.Integer(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('why_it_matters', sa.Text(), nullable=False),
        sa.Column('evidence', sa.JSON(), nullable=False),
        sa.Column('recommended_actions', sa.JSON(), nullable=False),
        sa.Column('suggested_response', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['problem_id'], ['problem_clusters.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_insights_problem_id'), 'insights', ['problem_id'], unique=False)


def downgrade() -> None:
    op.drop_table('insights')
    op.drop_table('recommendations')
    op.drop_table('trends')
    op.drop_table('problem_feedback')
    op.drop_table('problem_clusters')
    op.drop_table('feedback_embeddings')
    op.drop_table('feedback_analysis')
    op.drop_table('feedback')
